// Vercel Serverless Function — /api/mlb/news?teamId=121
// Uses MLB.com team-specific RSS feeds for reliable headlines
import { handleCors } from '../_cors.js'

// MLB Stats API team ID → mlb.com URL slug
const TEAM_SLUGS = {
  108: 'angels',
  109: 'dbacks',
  110: 'orioles',
  111: 'redsox',
  112: 'cubs',
  113: 'reds',
  114: 'guardians',
  115: 'rockies',
  116: 'tigers',
  117: 'astros',
  118: 'royals',
  119: 'dodgers',
  120: 'nationals',
  121: 'mets',
  133: 'athletics',
  134: 'pirates',
  135: 'padres',
  136: 'mariners',
  137: 'giants',
  138: 'cardinals',
  139: 'rays',
  140: 'rangers',
  141: 'bluejays',
  142: 'twins',
  143: 'phillies',
  144: 'braves',
  145: 'whitesox',
  146: 'marlins',
  147: 'yankees',
  158: 'brewers',
}

// Simple XML tag extractor (no library needed)
function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g')
  const matches = []
  let match
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1] || match[2] || '')
  }
  return matches
}

// Parse RSS items from XML string
function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let itemMatch

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1]

    const titles = extractTag(itemXml, 'title')
    const links = extractTag(itemXml, 'link')
    const pubDates = extractTag(itemXml, 'pubDate')

    if (titles.length > 0) {
      const title = titles[0].trim()
      const link = links.length > 0 ? links[0].trim() : '#'
      const pubDate = pubDates.length > 0 ? pubDates[0].trim() : ''

      // Format date
      let time = ''
      if (pubDate) {
        try {
          time = new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch {}
      }

      items.push({ title, link, source: 'MLB.com', time })
    }
  }

  return items
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const teamId = parseInt(req.query.teamId, 10)

  try {
    let items = []

    // Try team-specific MLB.com RSS feed
    const slug = teamId ? TEAM_SLUGS[teamId] : null
    if (slug) {
      try {
        const response = await fetch(
          `https://www.mlb.com/${slug}/feeds/news/rss.xml`,
          {
            headers: {
              'User-Agent': 'ScorePorch/1.0',
              'Accept': 'application/rss+xml, application/xml, text/xml',
            },
          }
        )
        if (response.ok) {
          const xml = await response.text()
          items = parseRSS(xml)
        }
      } catch (e) {
        // Fall through to general feed
      }
    }

    // Fall back to general MLB news
    if (items.length === 0) {
      try {
        const response = await fetch(
          'https://www.mlb.com/feeds/news/rss.xml',
          { headers: { 'User-Agent': 'ScorePorch/1.0' } }
        )
        if (response.ok) {
          const xml = await response.text()
          items = parseRSS(xml)
        }
      } catch (e) {
        // Return empty
      }
    }

    // Return top 3
    res.json({ items: items.slice(0, 3) })
  } catch (err) {
    console.error('News error:', err.message)
    res.json({ items: [] })
  }
}
