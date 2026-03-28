// Vercel Serverless Function — /api/mlb/next-game?teamId=121
import { handleCors } from '../_cors.js'

const MLB_API = 'https://statsapi.mlb.com/api/v1'

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const teamId = parseInt(req.query.teamId, 10)
  if (!teamId) return res.status(400).json({ error: 'teamId required' })

  try {
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

    const response = await fetch(
      `${MLB_API}/schedule?sportId=1&teamId=${teamId}&startDate=${startDate}&endDate=${endDate}`
    )
    const data = await response.json()

    const allGames = (data.dates || []).flatMap(d => d.games || [])
    const nextGame = allGames.find(g => {
      const status = g.status?.statusCode || ''
      return ['S', 'PW', 'P'].includes(status)
    })

    if (!nextGame) return res.json({ gameDate: null })

    res.json({
      gameDate: nextGame.gameDate,
      gamePk: nextGame.gamePk,
      opponent: nextGame.teams.home.team.id === teamId
        ? nextGame.teams.away.team.abbreviation
        : nextGame.teams.home.team.abbreviation,
      isHome: nextGame.teams.home.team.id === teamId,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch next game' })
  }
}
