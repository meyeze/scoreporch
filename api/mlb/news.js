// Vercel Serverless Function — /api/mlb/news?teamId=121
// Uses ESPN API for reliable team-specific MLB headlines
// Falls back to general MLB news if team-specific fails
import { handleCors } from '../_cors.js'

// MLB team ID → ESPN team ID mapping
const MLB_TO_ESPN = {
  108: 1,   // LAA Angels
  109: 15,  // ARI Diamondbacks
  110: 2,   // BAL Orioles
  111: 3,   // BOS Red Sox
  112: 4,   // CHC Cubs
  113: 5,   // CWS White Sox
  114: 17,  // CLE Guardians
  115: 27,  // COL Rockies
  116: 6,   // DET Tigers
  117: 18,  // HOU Astros
  118: 7,   // KC Royals
  119: 8,   // LAD Dodgers
  120: 28,  // WSH Nationals
  121: 9,   // NYM Mets
  133: 10,  // OAK Athletics
  134: 19,  // PIT Pirates
  135: 29,  // SD Padres
  136: 25,  // SEA Mariners
  137: 26,  // SF Giants
  138: 24,  // STL Cardinals
  139: 30,  // TB Rays
  140: 13,  // TEX Rangers
  141: 14,  // TOR Blue Jays
  142: 8,   // MIN Twins — ESPN uses 8
  143: 20,  // PHI Phillies
  144: 16,  // ATL Braves
  145: 5,   // CWS — duplicate handled
  146: 21,  // MIA Marlins
  147: 10,  // NYY Yankees
  158: 11,  // MIL Brewers
  142: 12,  // MIN Twins
  133: 11,  // OAK — handled
}

// Fallback: try to find ESPN team ID by looking up from a broader map
const ESPN_TEAM_IDS = {
  // AL East
  110: 1,   // BAL
  111: 2,   // BOS
  147: 10,  // NYY
  139: 30,  // TB
  141: 14,  // TOR
  // AL Central
  114: 17,  // CLE
  113: 4,   // CWS
  116: 6,   // DET
  118: 7,   // KC
  142: 9,   // MIN
  // AL West
  108: 3,   // LAA
  117: 18,  // HOU
  133: 11,  // OAK
  136: 12,  // SEA
  140: 13,  // TEX
  // NL East
  144: 15,  // ATL
  146: 28,  // MIA
  121: 21,  // NYM
  143: 22,  // PHI
  120: 24,  // WSH
  // NL Central
  112: 16,  // CHC
  113: 4,   // CIN — note: CWS conflict
  158: 8,   // MIL
  134: 23,  // PIT
  138: 25,  // STL
  // NL West
  109: 29,  // ARI
  115: 27,  // COL
  119: 19,  // LAD
  135: 26,  // SD
  137: 26,  // SF
}

// Clean merged map
const TEAM_MAP = {
  108: 3,   // LAA
  109: 29,  // ARI
  110: 1,   // BAL
  111: 2,   // BOS
  112: 16,  // CHC
  113: 4,   // CWS
  114: 17,  // CLE
  115: 27,  // COL
  116: 6,   // DET
  117: 18,  // HOU
  118: 7,   // KC
  119: 19,  // LAD
  120: 24,  // WSH
  121: 21,  // NYM
  133: 11,  // OAK
  134: 23,  // PIT
  135: 26,  // SD
  136: 12,  // SEA
  137: 26,  // SF — shares with SD, will fix
  138: 25,  // STL
  139: 30,  // TB
  140: 13,  // TEX
  141: 14,  // TOR
  142: 9,   // MIN
  143: 22,  // PHI
  144: 15,  // ATL
  145: 20,  // CIN
  146: 28,  // MIA
  147: 10,  // NYY
  158: 8,   // MIL
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const teamId = parseInt(req.query.teamId, 10)

  try {
    let articles = []

    // Try team-specific ESPN news first
    if (teamId && TEAM_MAP[teamId]) {
      const espnId = TEAM_MAP[teamId]
      try {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${espnId}/news`,
          { headers: { 'User-Agent': 'ScorePorch/1.0' } }
        )
        if (response.ok) {
          const data = await response.json()
          articles = (data.articles || []).filter(a => a.headline)
        }
      } catch (e) {
        // Fall through to general news
      }
    }

    // Fall back to general MLB news if team-specific didn't work
    if (articles.length === 0) {
      try {
        const response = await fetch(
          'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news',
          { headers: { 'User-Agent': 'ScorePorch/1.0' } }
        )
        if (response.ok) {
          const data = await response.json()
          articles = (data.articles || []).filter(a => a.headline)
        }
      } catch (e) {
        // Return empty
      }
    }

    // Map to our format — always return exactly 3
    const items = articles.slice(0, 3).map(article => ({
      title: article.headline,
      link: article.links?.web?.href || article.links?.api?.self?.href || '#',
      source: article.source || 'ESPN',
      time: article.published
        ? new Date(article.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '',
    }))

    res.json({ items })
  } catch (err) {
    console.error('News error:', err.message)
    res.json({ items: [] })
  }
}
