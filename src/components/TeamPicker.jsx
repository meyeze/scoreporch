import React, { useState, useMemo } from 'react'
import MLB_TEAMS, { teamLogo, getAllDivisions, getTeamsByDivision } from '../data/teams'
import './TeamPicker.css'

export default function TeamPicker({ onSelect }) {
  const [hoveredTeam, setHoveredTeam] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null) // for confirm animation
  const divisions = getAllDivisions()

  // Filter teams by search
  const filteredDivisions = useMemo(() => {
    if (!search.trim()) return divisions.map(d => ({ name: d, teams: getTeamsByDivision(d) }))
    const q = search.toLowerCase()
    return divisions.map(d => ({
      name: d,
      teams: getTeamsByDivision(d).filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.abbr.toLowerCase().includes(q) ||
        t.division.toLowerCase().includes(q)
      ),
    })).filter(d => d.teams.length > 0)
  }, [search, divisions])

  const handleSelect = (team) => {
    setSelectedTeam(team)
    // Brief delay for the selection animation before navigating
    setTimeout(() => onSelect(team.id), 400)
  }

  return (
    <div className="team-picker" style={hoveredTeam ? {
      '--hover-primary': hoveredTeam.colors.primary,
      '--hover-secondary': hoveredTeam.colors.secondary,
    } : {}}>
      {/* Ambient glow that follows hover */}
      <div className={`tp-ambient ${hoveredTeam ? 'active' : ''}`}
        style={hoveredTeam ? { '--glow-color': hoveredTeam.colors.primary } : {}} />

      <div className="tp-header">
        <div className="tp-logo-mark">
          <img src="/logo.png" alt="ScorePorch" className="tp-logo-img" />
          <span className="tp-logo">ScorePorch</span>
        </div>
        <h1 className="tp-title">Pick Your Team</h1>
        <p className="tp-subtitle">Your personalized MLB scoreboard — live scores, standings, countdowns, and box scores themed to your team's colors.</p>

        {/* Search */}
        <div className="tp-search-wrap">
          <input
            type="text"
            className="tp-search"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="tp-search-clear" onClick={() => setSearch('')}>&#10005;</button>
          )}
        </div>
      </div>

      <div className="tp-grid">
        {filteredDivisions.map(({ name, teams }) => (
          <div key={name} className="tp-division">
            <h3 className="tp-division-label">{name}</h3>
            <div className="tp-teams">
              {teams.map(team => (
                <button
                  key={team.id}
                  className={`tp-team-btn ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(team)}
                  onMouseEnter={() => setHoveredTeam(team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                  style={{
                    '--btn-color': team.colors.primary,
                    '--btn-secondary': team.colors.secondary,
                  }}
                >
                  <img src={teamLogo(team.abbr)} alt={team.name} className="tp-team-logo" onError={e => e.target.style.display = 'none'} />
                  <div className="tp-team-info">
                    <span className="tp-team-name">{team.name.split(' ').pop()}</span>
                    <span className="tp-team-city">{team.name.replace(/ \w+$/, '')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredDivisions.length === 0 && (
          <div className="tp-no-results">No teams match "{search}"</div>
        )}
      </div>

      {/* Hover preview card */}
      {hoveredTeam && !selectedTeam && (
        <div className="tp-preview" style={{ borderColor: hoveredTeam.colors.primary, boxShadow: `0 0 24px ${hoveredTeam.colors.primary}33` }}>
          <img src={teamLogo(hoveredTeam.abbr)} alt="" className="tp-preview-logo" />
          <div className="tp-preview-info">
            <div className="tp-preview-name">{hoveredTeam.name}</div>
            <div className="tp-preview-division">{hoveredTeam.division}</div>
            <div className="tp-preview-colors">
              <span className="tp-color-swatch" style={{ background: hoveredTeam.colors.primary }}></span>
              <span className="tp-color-swatch" style={{ background: hoveredTeam.colors.secondary }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Selection confirmation overlay */}
      {selectedTeam && (
        <div className="tp-confirm-overlay" style={{ '--confirm-color': selectedTeam.colors.primary }}>
          <img src={teamLogo(selectedTeam.abbr)} alt="" className="tp-confirm-logo" />
          <div className="tp-confirm-text">Let's go, {selectedTeam.name.split(' ').pop()}!</div>
        </div>
      )}

      <div className="tp-footer">
        <p>Free tier includes one team. <span className="tp-premium-hint">Want multiple teams? Upgrade to Premium.</span></p>
      </div>
    </div>
  )
}
