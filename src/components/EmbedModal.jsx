import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getTeamById, teamLogo } from '../data/teams'
import './EmbedModal.css'

const ALL_MODULES = [
  { key: 'scores', label: 'Live Scores', description: 'Current game score with team logos' },
  { key: 'headlines', label: 'Headlines', description: 'Team-specific ESPN news feed' },
  { key: 'countdown', label: 'Game Countdown', description: 'Timer until next game starts' },
  { key: 'standings', label: 'Standings', description: 'Division standings table' },
  { key: 'boxscores', label: 'Box Scores', description: 'Live batter stats during games' },
]

export default function EmbedModal({ teamId, onClose }) {
  const { user, tier, session } = useAuth()
  const team = getTeamById(teamId)

  const [modules, setModules] = useState(['scores', 'headlines', 'countdown', 'standings'])
  const [branding, setBranding] = useState(true)
  const [label, setLabel] = useState('')
  const [snippet, setSnippet] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('configure') // 'configure' | 'snippet'

  const isPro = tier === 'pro'
  const canEmbed = tier === 'premium' || tier === 'pro'

  const toggleModule = (key) => {
    setModules(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  const handleGenerate = async () => {
    if (!canEmbed) return
    setLoading(true)
    setError(null)

    try {
      const token = session?.access_token
      const res = await fetch('/api/widget/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId,
          modules,
          branding: isPro ? branding : true,
          label: label || `${team?.name || 'My'} Widget`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate embed code')
        return
      }

      setSnippet(data.snippet)
      setStep('snippet')
    } catch (err) {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = snippet
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (!canEmbed) {
    return (
      <div className="embed-overlay" onClick={onClose}>
        <div className="embed-modal" onClick={(e) => e.stopPropagation()}>
          <button className="embed-close" onClick={onClose}>&times;</button>
          <div className="embed-upgrade-prompt">
            <h2>Embed Widget</h2>
            <p>The embed widget is available on Premium and Pro plans. Upgrade to add a live scoreboard to any website.</p>
            <div className="embed-tier-comparison">
              <div className="embed-tier-card">
                <span className="embed-tier-name">Premium</span>
                <span className="embed-tier-price">$4/mo</span>
                <span className="embed-tier-desc">Basic embed widget with ScorePorch branding</span>
              </div>
              <div className="embed-tier-card embed-tier-card--pro">
                <span className="embed-tier-name">Pro</span>
                <span className="embed-tier-price">$8/mo</span>
                <span className="embed-tier-desc">Customizable embed + white-label (remove branding)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="embed-overlay" onClick={onClose}>
      <div className="embed-modal embed-modal--wide" onClick={(e) => e.stopPropagation()}>
        <button className="embed-close" onClick={onClose}>&times;</button>

        {step === 'configure' ? (
          <>
            <div className="embed-header">
              <img src={teamLogo(team?.abbr)} alt={team?.name} className="embed-team-logo" />
              <div>
                <h2 className="embed-title">Embed Widget</h2>
                <p className="embed-subtitle">Add a live {team?.name} scoreboard to any website</p>
              </div>
            </div>

            {/* Label */}
            <div className="embed-section">
              <label className="embed-label">Widget Label (optional)</label>
              <input
                type="text"
                className="embed-input"
                placeholder="e.g. My Blog Sidebar"
                value={label}
                onChange={e => setLabel(e.target.value)}
              />
            </div>

            {/* Module picker */}
            <div className="embed-section">
              <label className="embed-label">Modules</label>
              <div className="embed-modules">
                {ALL_MODULES.map(mod => (
                  <button
                    key={mod.key}
                    className={`embed-module-btn ${modules.includes(mod.key) ? 'embed-module-btn--active' : ''}`}
                    onClick={() => toggleModule(mod.key)}
                  >
                    <span className="embed-module-check">{modules.includes(mod.key) ? '✓' : ''}</span>
                    <div>
                      <span className="embed-module-name">{mod.label}</span>
                      <span className="embed-module-desc">{mod.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* White-label toggle (Pro only) */}
            {isPro && (
              <div className="embed-section">
                <label className="embed-label">Branding</label>
                <button
                  className={`embed-toggle ${!branding ? 'embed-toggle--active' : ''}`}
                  onClick={() => setBranding(!branding)}
                >
                  <span className="embed-toggle-dot" />
                  <span>{branding ? 'ScorePorch branding shown' : 'White-label (no branding)'}</span>
                </button>
              </div>
            )}

            {error && <div className="embed-error">{error}</div>}

            <button
              className="embed-generate-btn"
              onClick={handleGenerate}
              disabled={loading || modules.length === 0}
            >
              {loading ? 'Generating...' : 'Generate Embed Code'}
            </button>
          </>
        ) : (
          <>
            <div className="embed-header">
              <img src={teamLogo(team?.abbr)} alt={team?.name} className="embed-team-logo" />
              <div>
                <h2 className="embed-title">Your Embed Code</h2>
                <p className="embed-subtitle">Paste this into your website's HTML</p>
              </div>
            </div>

            <div className="embed-snippet-container">
              <pre className="embed-snippet-code">{snippet}</pre>
              <button
                className={`embed-copy-btn ${copied ? 'embed-copy-btn--copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="embed-instructions">
              <p><strong>How to use:</strong></p>
              <p>1. Copy the code above</p>
              <p>2. Paste it into your website's HTML where you want the widget to appear</p>
              <p>3. The widget will automatically load and start showing live data</p>
            </div>

            <button className="embed-back-btn" onClick={() => { setStep('configure'); setSnippet('') }}>
              ← Configure Another Widget
            </button>
          </>
        )}
      </div>
    </div>
  )
}
