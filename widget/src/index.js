/**
 * ScorePorch Embeddable Widget
 *
 * Usage:
 * <script src="https://app.scoreporch.com/widget/scoreporch-widget.js"
 *   data-embed-id="YOUR_EMBED_ID"
 *   data-team="121"
 *   data-modules="scores,headlines,countdown,standings"
 *   data-theme="dark">
 * </script>
 *
 * The script auto-initializes by finding its own <script> tag,
 * then renders a Shadow DOM widget right after it.
 */

import { WidgetAPI } from './api.js'
import { getTeamById, teamLogo } from './teams.js'
import { renderScore, renderHeadlines, renderCountdown, renderStandings, renderLoading } from './render.js'
import getStyles from './styles.js'

class ScorePorchWidget {
  constructor(scriptEl) {
    // Read config from data attributes
    this.embedId = scriptEl.dataset.embedId || ''
    this.teamId = parseInt(scriptEl.dataset.team, 10)
    this.modules = (scriptEl.dataset.modules || 'scores,headlines,countdown,standings').split(',').map(s => s.trim())
    this.showBranding = scriptEl.dataset.branding !== 'false' // Pro users can hide
    this.baseUrl = scriptEl.dataset.api || scriptEl.src.replace(/\/widget\/scoreporch-widget\.js.*$/, '')

    // Resolve team info
    this.team = getTeamById(this.teamId)
    if (!this.team) {
      console.error('[ScorePorch] Invalid team ID:', this.teamId)
      return
    }

    // State
    this.data = { scores: null, standings: null, nextGame: null, news: null }
    this.countdown = null
    this.countdownTimer = null
    this.api = new WidgetAPI(this.baseUrl, this.embedId)

    // Create DOM
    this.container = document.createElement('div')
    this.container.className = 'scoreporch-embed'
    scriptEl.parentNode.insertBefore(this.container, scriptEl.nextSibling)

    this.shadow = this.container.attachShadow({ mode: 'closed' })

    // Inject styles
    const styleEl = document.createElement('style')
    styleEl.textContent = getStyles(this.team.primary, this.team.secondary)
    this.shadow.appendChild(styleEl)

    // Render container
    this.root = document.createElement('div')
    this.root.className = 'sp-widget'
    this.shadow.appendChild(this.root)

    // Initial render (loading state)
    this.root.innerHTML = renderLoading()

    // Start fetching
    this.init()
  }

  init() {
    const teamId = this.teamId
    const division = this.team.division

    // Scores — every 60s
    if (this.modules.includes('scores') || this.modules.includes('boxscores')) {
      this.api.poll('/api/mlb/scores', { teamId }, 60000, (data) => {
        this.data.scores = data
        // Fetch box score if live
        if (data?.gamePk && data?.isLive && this.modules.includes('boxscores')) {
          this.fetchBoxScore(data.gamePk)
        }
        this.render()
      })
    }

    // Standings — every 5 min
    if (this.modules.includes('standings')) {
      this.api.poll('/api/mlb/standings', { division }, 300000, (data) => {
        this.data.standings = data
        this.render()
      })
    }

    // Next game (countdown) — every 60s
    if (this.modules.includes('countdown')) {
      this.api.poll('/api/mlb/next-game', { teamId }, 60000, (data) => {
        this.data.nextGame = data
        this.render()
      })

      // Countdown tick every second
      this.countdownTimer = setInterval(() => {
        if (this.data.nextGame?.gameDate) {
          this.countdown = this.calcCountdown(this.data.nextGame.gameDate)
          this.updateCountdownDOM()
        }
      }, 1000)
    }

    // News/headlines — every 30 min
    if (this.modules.includes('headlines')) {
      this.api.poll('/api/mlb/news', { teamId }, 1800000, (data) => {
        this.data.news = data
        this.render()
      })
    }
  }

  async fetchBoxScore(gamePk) {
    try {
      const data = await this.api.fetch(`/api/mlb/boxscore/${gamePk}`)
      if (data?.status === 'live') {
        // Attach box score batters to scores data for rendering
        const teamBatters = data.home?.teamId === this.teamId
          ? data.home?.batters
          : data.away?.batters
        if (this.data.scores) {
          this.data.scores.boxScore = teamBatters || []
        }
        this.render()
      }
    } catch { /* silent */ }
  }

  calcCountdown(dateStr) {
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

  // Fast DOM update for countdown (avoids full re-render every second)
  updateCountdownDOM() {
    const nums = this.root.querySelectorAll('.sp-w-countdown-num')
    if (nums.length === 4 && this.countdown) {
      nums[0].textContent = this.countdown.d
      nums[1].textContent = this.countdown.h
      nums[2].textContent = this.countdown.m
      nums[3].textContent = this.countdown.s
    }
  }

  render() {
    const teamNickname = this.team.name.split(' ').pop()
    const isLive = this.data.scores?.isLive || false

    let html = ''

    // Top row: score + headlines side by side
    const hasScore = this.modules.includes('scores')
    const hasHeadlines = this.modules.includes('headlines')

    if (hasScore || hasHeadlines) {
      html += '<div class="sp-w-top-row">'
      if (hasScore) {
        html += renderScore(this.data.scores, this.team.abbr, this.teamId)
      }
      if (hasHeadlines) {
        html += renderHeadlines(this.data.news?.items, teamNickname)
      }
      html += '</div>'
    }

    // Countdown
    if (this.modules.includes('countdown')) {
      if (!this.countdown && this.data.nextGame?.gameDate) {
        this.countdown = this.calcCountdown(this.data.nextGame.gameDate)
      }
      html += renderCountdown(this.data.nextGame, this.countdown, isLive, teamNickname)
    }

    // Standings
    if (this.modules.includes('standings')) {
      const teams = this.data.standings?.teams || []
      html += renderStandings(teams, this.team.division, this.teamId)
    }

    // Branding footer (hidden for Pro/white-label)
    if (this.showBranding) {
      html += `
        <div class="sp-w-branding">
          <a href="https://scoreporch.com" target="_blank" rel="noreferrer">Powered by ScorePorch</a>
        </div>`
    }

    this.root.innerHTML = html
  }

  destroy() {
    this.api.destroy()
    if (this.countdownTimer) clearInterval(this.countdownTimer)
    this.container?.remove()
  }
}

// ── Auto-init ───────────────────────────────────────────
// Find the script tag that loaded this file and init the widget
;(function () {
  const scripts = document.querySelectorAll('script[data-embed-id]')
  const currentScript = document.currentScript || scripts[scripts.length - 1]

  if (!currentScript) {
    console.error('[ScorePorch] Could not find widget script tag. Make sure data-embed-id is set.')
    return
  }

  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ScorePorchWidget(currentScript))
  } else {
    new ScorePorchWidget(currentScript)
  }

  // Expose for manual control
  window.ScorePorchWidget = ScorePorchWidget
})()
