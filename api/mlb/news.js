// Vercel Serverless Function — /api/mlb/news
export default async function handler(req, res) {
  try {
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
    res.json({ items: [] })
  }
}
