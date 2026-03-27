import React, { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { teamLogo, getTeamById } from '../data/teams'
import './Scoreboard.css'

// Loading skeleton block
function Skeleton({ width, height = 14 }) {
  return <div className="sp-skeleton" style={{ width, height, minWidth: width }} />
}

export default function Scoreboard({ teamId, onSwitchTeam }) {
  const team = getTeamById(teamId)
  if (!team) return null

  const division = team.division
  const teamNickname = team.name.split(' ').pop()

  // ─── Live API data ─────────────────────────────────────
  const { data: scoresData, loading: scoresLoading } = useApi(`/api/mlb/scores?teamId=${teamId}`, { interval: 60000 })
  const { data: standingsData, loading: standingsLoading } = useApi(`/api/mlb/standings?division=${encodeURIComponent(division)}`, { interval: 300000 })
  const { data: nextGameData } = useApi(`/api/mlb/next-game?teamId=${teamId}`, { interval: 60000 })
  const { data: newsData, loading: newsLoading } = useApi(`/api/mlb/news?teamId=${teamId}`, { interval: 1800000 })

  // ─── Countdown timer ───────────────────────────────────
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      if (nextGameData?.gameDate) {
        setCountdown(getCountdown(nextGameData.gameDate))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [nextGameData])

  function getCountdown(dateStr) {
    const diff = new Date(dateStr) - new Date()
    if (diff <= 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return {
      d: String(d).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
    }
  }

  // ─── Box score data ────────────────────────────────────
  const [boxScore, setBoxScore] = useState(null)

  useEffect(() => {
    async function fetchBoxScore() {
      if (!scoresData?.gamePk) return
      try {
        const res = await fetch(`/api/mlb/boxscore/${scoresData.gamePk}`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.status === 'live') setBoxScore(data)
        else setBoxScore(null)
      } catch { setBoxScore(null) }
    }
    fetchBoxScore()
  }, [scoresData])

  // ─── Resolve data ──────────────────────────────────────
  const game = scoresData || null
  const isLive = game?.isLive || false
  const standings = standingsData?.teams || []
  const headlines = newsData?.items?.slice(0, 3) || []

  const getTeamBatters = (boxData) => {
    if (!boxData) return []
    if (boxData.home?.teamId === teamId) return boxData.home.batters || []
    if (boxData.away?.teamId === teamId) return boxData.away.batters || []
    return []
  }
  const batters = getTeamBatters(boxScore)

  return (
    <div className="scoreboard">
      {/* Score Card + Headlines Row */}
      <div className="score-headlines-row">
        <div className="sp-module score-card">
          {scoresLoading && !game ? (
            <div className="score-loading">
              <Skeleton width={44} height={44} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <Skeleton width={80} height={20} />
                <Skeleton width={100} height={10} />
              </div>
            </div>
          ) : game ? (
            <>
              <div className="score-header-row">
                <img src={teamLogo(game.team)} alt={game.team} className="team-logo" onError={e => e.target.style.display = 'none'} />
                <div className="score-teams">
                  <span className="score-num">{game.teamScore}</span>
                  <span className="score-vs">|</span>
                  <span className="score-num opp">{game.oppScore}</span>
                </div>
                {game.opponent !== '—' && (
                  <img src={teamLogo(game.opponent)} alt={game.opponent} className="team-logo" onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <div className="score-detail">
                {isLive && <span className="live-dot" />}
                {game.status}{isLive ? ' — LIVE' : ''}
              </div>

              {/* Live Box Score */}
              {batters.length > 0 && (
                <div className="boxscore-scroll">
                  <table className="boxscore-table">
                    <thead>
                      <tr>
                        <th className="bs-player">Batters · {game.team}</th>
                        <th>R</th><th>H</th><th>AVG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batters.map((b, i) => (
                        <tr key={i}>
                          <td className="bs-player">{b.name} <span className="bs-pos">{b.position}</span></td>
                          <td>{b.r}</td><td>{b.h}</td><td>{b.avg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="score-empty">
              <img src={teamLogo(team.abbr)} alt={team.name} className="team-logo" style={{ opacity: 0.4 }} />
              <span className="score-detail">No recent game data</span>
            </div>
          )}
        </div>

        <div className="sp-module headlines-module">
          <h3 className="sp-module-title">{teamNickname.toUpperCase()} HEADLINES</h3>
          <div className="headlines-list">
            {newsLoading && headlines.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="headline-item">
                  <Skeleton width={14} height={14} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <Skeleton width="90%" height={10} />
                    <Skeleton width="40%" height={8} />
                  </div>
                </div>
              ))
            ) : headlines.length > 0 ? headlines.map((h, i) => (
              <div key={i} className="headline-item">
                <span className="headline-num">{i + 1}</span>
                <a href={h.link} target="_blank" rel="noreferrer" className="headline-link">
                  <span className="headline-text">{h.title}</span>
                  <span className="headline-source">{h.source}{h.time ? ` · ${h.time}` : ''}</span>
                </a>
              </div>
            )) : (
              <div className="headline-item">
                <span className="headline-text" style={{ opacity: 0.5, fontStyle: 'italic' }}>No headlines available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="sp-module countdown-module">
        <div className="countdown-header">Next {teamNickname} Game{nextGameData?.opponent ? ` vs ${nextGameData.opponent}` : ''}</div>
        {isLive ? (
          <div className="countdown-live-text">
            <span className="live-dot" />
            LIVE NOW! <a href="https://www.mlb.tv" target="_blank" rel="noreferrer">Watch on MLB.TV</a>
          </div>
        ) : countdown ? (
          <div className="countdown-display">
            <div className="countdown-unit"><span className="countdown-num">{countdown.d}</span><span className="countdown-label">Days</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-num">{countdown.h}</span><span className="countdown-label">Hrs</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-num">{countdown.m}</span><span className="countdown-label">Mins</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-num">{countdown.s}</span><span className="countdown-label">Secs</span></div>
          </div>
        ) : (
          <div className="countdown-empty">No upcoming game scheduled</div>
        )}
      </div>

      {/* Standings */}
      <div className="sp-module standings-module">
        <h3 className="sp-module-title">{division.toUpperCase()}</h3>
        <div className="standings-table">
          <div className="standings-header-row">
            <div className="st-team">Team</div>
            <div className="st-num">W</div>
            <div className="st-num">L</div>
            <div className="st-num">PCT</div>
            <div className="st-num">GB</div>
          </div>
          {standingsLoading && standings.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="standings-data-row">
                <div className="st-team"><Skeleton width={20} height={20} /><Skeleton width={60} height={10} /></div>
                <div className="st-num"><Skeleton width={18} height={10} /></div>
                <div className="st-num"><Skeleton width={18} height={10} /></div>
                <div className="st-num"><Skeleton width={28} height={10} /></div>
                <div className="st-num"><Skeleton width={22} height={10} /></div>
              </div>
            ))
          ) : standings.length > 0 ? standings.map((row, idx) => (
            <div key={idx} className={`standings-data-row ${row.teamId === teamId ? 'highlight-team' : ''}`}>
              <div className="st-team">
                {row.abbreviation && <img src={teamLogo(row.abbreviation)} alt="" className="standings-logo" onError={e => e.target.style.display = 'none'} />}
                <span>{row.team}</span>
              </div>
              <div className="st-num">{row.w}</div>
              <div className="st-num">{row.l}</div>
              <div className="st-num">{row.pct}</div>
              <div className="st-num">{row.gb}</div>
            </div>
          )) : (
            <div className="standings-empty">Standings not available yet — check back when the season starts</div>
          )}
        </div>
      </div>

      {/* Switch Team */}
      {onSwitchTeam && (
        <button className="sp-switch-team" onClick={onSwitchTeam}>
          ← Back to Teams
        </button>
      )}
    </div>
  )
}
