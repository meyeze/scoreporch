// Vercel Serverless Function — /api/mlb/scores?teamId=121
const MLB_API = 'https://statsapi.mlb.com/api/v1'

export default async function handler(req, res) {
  const teamId = parseInt(req.query.teamId, 10)
  if (!teamId) return res.status(400).json({ error: 'teamId required' })

  try {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const [todayRes, yesterdayRes] = await Promise.all([
      fetch(`${MLB_API}/schedule?sportId=1&date=${today}&hydrate=team,linescore`),
      fetch(`${MLB_API}/schedule?sportId=1&date=${yesterday}&hydrate=team,linescore`),
    ])

    const todayData = await todayRes.json()
    const yesterdayData = await yesterdayRes.json()

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

    const statusCode = game.status?.statusCode || ''
    const isLive = ['I', 'MA', 'MF', 'MI'].includes(statusCode)

    let statusText = game.status?.detailedState || 'Scheduled'
    if (isLive && game.linescore) {
      const inning = game.linescore.currentInning || 0
      const half = game.linescore.isTopInning ? 'Top' : 'Bot'
      statusText = `${half} ${inning}`
    }

    res.json({
      team: teamSide.team.abbreviation || '',
      opponent: oppSide.team.abbreviation || '',
      teamScore: teamSide.score || 0,
      oppScore: oppSide.score || 0,
      status: statusText,
      isLive,
      gamePk: game.gamePk,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' })
  }
}
