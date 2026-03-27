// ScorePorch — MLB Stats API Provider
// Refactored from Meyeze to accept dynamic team IDs and divisions
// Uses the free MLB Stats API (statsapi.mlb.com)

import fetch from 'node-fetch'

const MLB_API = 'https://statsapi.mlb.com/api/v1'

// ESPN CDN abbreviation mapping (handles mismatches)
const ESPN_MAP = { 'CWS': 'CHW', 'AZ': 'ARI', 'ARI': 'ARI' }
function espnAbbr(abbr) {
  return (ESPN_MAP[abbr] || abbr).toLowerCase()
}

// Division ID mapping for standings
const DIVISION_IDS = {
  'AL East': 201,
  'AL Central': 202,
  'AL West': 200,
  'NL East': 204,
  'NL Central': 205,
  'NL West': 203,
}

// ─── /api/mlb/scores?teamId=121 ──────────────────────────
// Returns the latest/current game for a specific team
export async function getScores(req, res) {
  const teamId = parseInt(req.query.teamId, 10)
  if (!teamId) return res.status(400).json({ error: 'teamId required' })

  try {
    const today = new Date().toISOString().split('T')[0]
    // Check today and yesterday to catch completed games
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const [todayRes, yesterdayRes] = await Promise.all([
      fetch(`${MLB_API}/schedule?sportId=1&date=${today}&hydrate=team,linescore`),
      fetch(`${MLB_API}/schedule?sportId=1&date=${yesterday}&hydrate=team,linescore`),
    ])

    const todayData = await todayRes.json()
    const yesterdayData = await yesterdayRes.json()

    // Find games for this team — prefer today, fall back to yesterday
    const allGames = [
      ...(todayData.dates?.[0]?.games || []),
      ...(yesterdayData.dates?.[0]?.games || []),
    ]

    const game = allGames.find(g =>
      g.teams.home.team.id === teamId || g.teams.away.team.id === teamId
    )

    if (!game) {
      return res.json({ team: '', opponent: '—', teamScore: 0, oppScore: 0, status: 'No game found', isLive: false })
    }

    const isHome = game.teams.home.team.id === teamId
    const teamSide = isHome ? game.teams.home : game.teams.away
    const oppSide = isHome ? game.teams.away : game.teams.home
    const teamAbbr = teamSide.team.abbreviation || ''
    const oppAbbr = oppSide.team.abbreviation || ''

    const statusCode = game.status?.statusCode || ''
    const isLive = ['I', 'MA', 'MF', 'MI'].includes(statusCode)
    const isOver = ['F', 'FT', 'FR', 'FO', 'O'].includes(statusCode)

    let statusText = game.status?.detailedState || 'Scheduled'
    if (isLive && game.linescore) {
      const inning = game.linescore.currentInning || 0
      const half = game.linescore.isTopInning ? 'Top' : 'Bot'
      statusText = `${half} ${inning}`
    }

    res.json({
      team: teamAbbr,
      opponent: oppAbbr,
      teamScore: teamSide.score || 0,
      oppScore: oppSide.score || 0,
      status: statusText,
      isLive,
      gamePk: game.gamePk,
    })
  } catch (err) {
    console.error('MLB scores error:', err.message)
    res.status(500).json({ error: 'Failed to fetch scores' })
  }
}

// ─── /api/mlb/standings?division=NL+East ─────────────────
// Returns standings for a specific division
export async function getStandings(req, res) {
  const division = req.query.division
  if (!division) return res.status(400).json({ error: 'division required' })

  const divisionId = DIVISION_IDS[division]
  if (!divisionId) return res.status(400).json({ error: `Unknown division: ${division}` })

  try {
    const year = new Date().getFullYear()
    const response = await fetch(`${MLB_API}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason`)
    const data = await response.json()

    const divRecord = data.records?.find(r => r.division?.id === divisionId)
    if (!divRecord) {
      return res.json({ teams: [] })
    }

    const teams = divRecord.teamRecords.map(tr => ({
      team: tr.team.name.split(' ').pop(), // Just the nickname
      teamId: tr.team.id,
      abbreviation: tr.team.abbreviation || '',
      w: tr.wins,
      l: tr.losses,
      pct: tr.winningPercentage || '.000',
      gb: tr.gamesBack === '-' ? '—' : tr.gamesBack,
    }))

    res.json({ division, teams })
  } catch (err) {
    console.error('MLB standings error:', err.message)
    res.status(500).json({ error: 'Failed to fetch standings' })
  }
}

// ─── /api/mlb/next-game?teamId=121 ──────────────────────
// Returns the next scheduled game for a team
export async function getNextGame(req, res) {
  const teamId = parseInt(req.query.teamId, 10)
  if (!teamId) return res.status(400).json({ error: 'teamId required' })

  try {
    const response = await fetch(
      `${MLB_API}/schedule?sportId=1&teamId=${teamId}&startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]}`
    )
    const data = await response.json()

    const allGames = (data.dates || []).flatMap(d => d.games || [])
    const nextGame = allGames.find(g => {
      const status = g.status?.statusCode || ''
      return ['S', 'PW', 'P'].includes(status) // Scheduled, Pre-game
    })

    if (!nextGame) {
      return res.json({ gameDate: null })
    }

    res.json({
      gameDate: nextGame.gameDate,
      gamePk: nextGame.gamePk,
      opponent: nextGame.teams.home.team.id === teamId
        ? nextGame.teams.away.team.abbreviation
        : nextGame.teams.home.team.abbreviation,
      isHome: nextGame.teams.home.team.id === teamId,
    })
  } catch (err) {
    console.error('MLB next-game error:', err.message)
    res.status(500).json({ error: 'Failed to fetch next game' })
  }
}

// ─── /api/mlb/boxscore/:gamePk ──────────────────────────
// Returns batter stats for a live game (unchanged from Meyeze — already generic)
export async function getBoxScore(req, res) {
  const { gamePk } = req.params
  if (!gamePk) return res.status(400).json({ error: 'gamePk required' })

  try {
    const response = await fetch(`${MLB_API}/game/${gamePk}/boxscore`)
    const data = await response.json()

    // Check if game is actually live
    const gameRes = await fetch(`${MLB_API}/game/${gamePk}/feed/live`)
    const gameData = await gameRes.json()
    const statusCode = gameData.gameData?.status?.statusCode || ''
    const isLive = ['I', 'MA', 'MF', 'MI'].includes(statusCode)

    if (!isLive) {
      return res.json({ status: 'not_live' })
    }

    const parseBatters = (teamData) => {
      const batters = teamData?.batters || []
      const players = teamData?.players || {}
      return batters.map(id => {
        const p = players[`ID${id}`]
        if (!p) return null
        const stats = p.stats?.batting || {}
        return {
          name: p.person?.fullName || 'Unknown',
          position: p.position?.abbreviation || '',
          r: stats.runs || 0,
          h: stats.hits || 0,
          avg: stats.avg || p.seasonStats?.batting?.avg || '.000',
        }
      }).filter(Boolean)
    }

    res.json({
      status: 'live',
      home: {
        teamId: data.teams?.home?.team?.id,
        batters: parseBatters(data.teams?.home),
      },
      away: {
        teamId: data.teams?.away?.team?.id,
        batters: parseBatters(data.teams?.away),
      },
    })
  } catch (err) {
    console.error('MLB boxscore error:', err.message)
    res.status(500).json({ error: 'Failed to fetch boxscore' })
  }
}

// ─── /api/mlb/news ──────────────────────────────────────
// Returns general MLB headlines (unchanged — already generic)
export async function getNews(req, res) {
  try {
    // Use MLB editorial content endpoint
    const response = await fetch('https://statsapi.mlb.com/api/v1/news?sportId=1')
    const data = await response.json()

    const items = (data.articles || []).slice(0, 10).map(article => ({
      title: article.headline || article.title || 'Untitled',
      link: article.url || '#',
      source: article.source || 'MLB.com',
      time: article.date ? new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    }))

    res.json({ items })
  } catch (err) {
    console.error('MLB news error:', err.message)
    // Fallback to empty
    res.json({ items: [] })
  }
}
