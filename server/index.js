// ScorePorch — Express API Server
import express from 'express'
import cors from 'cors'
import { getScores, getStandings, getNextGame, getBoxScore, getNews } from './api/mlb.js'

const app = express()
const PORT = process.env.PORT || 3080

app.use(cors())
app.use(express.json())

// MLB API routes
app.get('/api/mlb/scores', getScores)
app.get('/api/mlb/standings', getStandings)
app.get('/api/mlb/next-game', getNextGame)
app.get('/api/mlb/boxscore/:gamePk', getBoxScore)
app.get('/api/mlb/news', getNews)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'scoreporch-api', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`ScorePorch API running on port ${PORT}`)
})
