import React, { useState } from 'react'
import { useTeam } from './hooks/useTeam'
import { teamLogo } from './data/teams'
import TeamPicker from './components/TeamPicker'
import Scoreboard from './components/Scoreboard'

export default function App() {
  const { teamId, team, selectTeam, clearTeam, hasTeam } = useTeam()
  const [showPicker, setShowPicker] = useState(false)

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
        <div className="sp-topbar-brand">
          <img src="/logo.png" alt="ScorePorch" className="sp-brand-logo" />
          <span className="sp-brand-text">ScorePorch</span>
          <span className="sp-brand-badge">BETA</span>
        </div>
        <button className="sp-topbar-team" onClick={() => setShowPicker(true)}>
          <img src={teamLogo(team.abbr)} alt={team.name} className="sp-topbar-team-logo" />
          <span className="sp-topbar-team-name">{team.name}</span>
          <span className="sp-topbar-change">Change</span>
        </button>
      </nav>
      <Scoreboard teamId={teamId} />
      <footer className="sp-footer">
        <span className="sp-footer-text">ScorePorch — Your personalized MLB scoreboard</span>
        <span className="sp-footer-dot">·</span>
        <span className="sp-footer-text">Data from MLB Stats API</span>
      </footer>
    </div>
  )
}
