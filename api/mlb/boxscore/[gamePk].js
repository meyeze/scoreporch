// Vercel Serverless Function — /api/mlb/boxscore/[gamePk]
const MLB_API = 'https://statsapi.mlb.com/api/v1'

export default async function handler(req, res) {
  const { gamePk } = req.query
  if (!gamePk) return res.status(400).json({ error: 'gamePk required' })

  try {
    const [boxRes, liveRes] = await Promise.all([
      fetch(`${MLB_API}/game/${gamePk}/boxscore`),
      fetch(`${MLB_API}/game/${gamePk}/feed/live`),
    ])

    const data = await boxRes.json()
    const gameData = await liveRes.json()

    const statusCode = gameData.gameData?.status?.statusCode || ''
    const isLive = ['I', 'MA', 'MF', 'MI'].includes(statusCode)

    if (!isLive) return res.json({ status: 'not_live' })

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
      home: { teamId: data.teams?.home?.team?.id, batters: parseBatters(data.teams?.home) },
      away: { teamId: data.teams?.away?.team?.id, batters: parseBatters(data.teams?.away) },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch boxscore' })
  }
}
