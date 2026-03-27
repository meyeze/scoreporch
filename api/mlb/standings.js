// Vercel Serverless Function — /api/mlb/standings?division=NL+East
const MLB_API = 'https://statsapi.mlb.com/api/v1'

const DIVISION_IDS = {
  'AL East': 201, 'AL Central': 202, 'AL West': 200,
  'NL East': 204, 'NL Central': 205, 'NL West': 203,
}

export default async function handler(req, res) {
  const division = req.query.division
  if (!division) return res.status(400).json({ error: 'division required' })

  const divisionId = DIVISION_IDS[division]
  if (!divisionId) return res.status(400).json({ error: `Unknown division: ${division}` })

  try {
    const year = new Date().getFullYear()
    const response = await fetch(`${MLB_API}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason`)
    const data = await response.json()

    const divRecord = data.records?.find(r => r.division?.id === divisionId)
    if (!divRecord) return res.json({ teams: [] })

    const teams = divRecord.teamRecords.map(tr => ({
      team: tr.team.name.split(' ').pop(),
      teamId: tr.team.id,
      abbreviation: tr.team.abbreviation || '',
      w: tr.wins,
      l: tr.losses,
      pct: tr.winningPercentage || '.000',
      gb: tr.gamesBack === '-' ? '—' : tr.gamesBack,
    }))

    res.json({ division, teams })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch standings' })
  }
}
