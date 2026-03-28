import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTeam } from './hooks/useTeam'
import { teamLogo } from './data/teams'
import TeamPicker from './components/TeamPicker'
import Scoreboard from './components/Scoreboard'
import AuthPage from './components/AuthPage'
import AuthCallback from './components/AuthCallback'
import UpgradeModal from './components/UpgradeModal'
import EmbedModal from './components/EmbedModal'

function Dashboard() {
  const { user, tier, signOut } = useAuth()
  const { teamId, team, selectTeam, clearTeam, hasTeam } = useTeam(user?.id, tier)
  const [showPicker, setShowPicker] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  // No team selected — show picker
  if (!hasTeam || showPicker) {
    return (
      <TeamPicker
        onSelect={(id) => {
          selectTeam(id)
          setShowPicker(false)
        }}
        currentTeamId={teamId}
      />
    )
  }

  // Team selected — show scoreboard
  return (
    <div className="sp-app">
      <nav className="sp-topbar">
        <button className="sp-topbar-brand" onClick={() => setShowPicker(true)} title="Change team">
          <img src="/logo.png" alt="ScorePorch" className="sp-brand-logo" />
          <span className="sp-brand-text">ScorePorch</span>
          <span className="sp-brand-badge">BETA</span>
        </button>
        <div className="sp-topbar-right">
          <button className="sp-topbar-team" onClick={() => setShowPicker(true)}>
            <img src={teamLogo(team.abbr)} alt={team.name} className="sp-topbar-team-logo" />
            <span className="sp-topbar-team-name">{team.name}</span>
            <span className="sp-topbar-change">Change</span>
          </button>
          <button className="sp-topbar-embed" onClick={() => setShowEmbed(true)} title="Get embed code">
            &lt;/&gt; Embed
          </button>
          {tier === 'free' && (
            <button className="sp-topbar-upgrade" onClick={() => setShowUpgrade(true)}>
              Upgrade
            </button>
          )}
          <button className="sp-topbar-account" onClick={signOut} title="Sign out">
            <span className="sp-account-avatar">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </button>
        </div>
      </nav>
      <Scoreboard teamId={teamId} onSwitchTeam={() => setShowPicker(true)} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showEmbed && <EmbedModal teamId={teamId} onClose={() => setShowEmbed(false)} />}
      <footer className="sp-footer">
        <span className="sp-footer-text">ScorePorch — Your personalized MLB scoreboard</span>
        <span className="sp-footer-dot">·</span>
        <span className="sp-footer-text">Data from MLB Stats API</span>
      </footer>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-text)',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
      } />
      <Route path="/*" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}
