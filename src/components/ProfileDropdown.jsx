import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import './ProfileDropdown.css'

export default function ProfileDropdown() {
  const { user, tier, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const initial = user?.email?.[0]?.toUpperCase() || '?'
  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'User'

  const tierLabel = {
    free: 'Free',
    premium: 'Premium',
    pro: 'Pro',
  }[tier] || 'Free'

  const tierClass = tier === 'pro' ? 'pro' : tier === 'premium' ? 'premium' : 'free'

  return (
    <div className="sp-profile-wrapper" ref={ref}>
      <button
        className={`sp-topbar-account ${open ? 'sp-topbar-account--open' : ''}`}
        onClick={() => setOpen(!open)}
        title="Account"
      >
        <span className="sp-account-avatar">{initial}</span>
      </button>

      {open && (
        <div className="sp-profile-dropdown">
          <div className="sp-profile-header">
            <div className="sp-profile-avatar-lg">{initial}</div>
            <div className="sp-profile-info">
              <span className="sp-profile-name">{displayName}</span>
              <span className="sp-profile-email">{user?.email}</span>
            </div>
          </div>

          <div className="sp-profile-divider" />

          <div className="sp-profile-section">
            <div className="sp-profile-row">
              <span className="sp-profile-label">Plan</span>
              <span className={`sp-profile-tier sp-profile-tier--${tierClass}`}>{tierLabel}</span>
            </div>
            <div className="sp-profile-row">
              <span className="sp-profile-label">Member since</span>
              <span className="sp-profile-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>

          <div className="sp-profile-divider" />

          <button className="sp-profile-signout" onClick={() => { setOpen(false); signOut() }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
