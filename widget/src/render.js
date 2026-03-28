// Widget DOM renderers — pure functions that return HTML strings
import { teamLogo } from './teams.js'

// ── Score Card ──────────────────────────────────────────
export function renderScore(data, teamAbbr, teamId) {
  if (!data) {
    return `
      <div class="sp-w-module sp-w-score">
        <div class="sp-w-score-empty">
          <img class="sp-w-team-logo" src="${teamLogo(teamAbbr)}" alt="${teamAbbr}" onerror="this.style.display='none'">
          <div class="sp-w-score-detail">No recent game data</div>
        </div>
      </div>`
  }

  const isLive = data.isLive || false
  const liveDot = isLive ? '<span class="sp-w-live-dot"></span>' : ''
  const liveText = isLive ? ' — LIVE' : ''

  // Box score section
  let boxHtml = ''
  if (data.boxScore && data.boxScore.length > 0) {
    const rows = data.boxScore.map(b =>
      `<tr><td>${b.name} <span class="sp-w-bs-pos">${b.position}</span></td><td>${b.r}</td><td>${b.h}</td><td>${b.avg}</td></tr>`
    ).join('')
    boxHtml = `
      <div class="sp-w-boxscore">
        <table>
          <thead><tr><th>${data.team} Batters</th><th>R</th><th>H</th><th>AVG</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
  }

  return `
    <div class="sp-w-module sp-w-score">
      <div class="sp-w-score-row">
        <img class="sp-w-team-logo" src="${teamLogo(data.team)}" alt="${data.team}" onerror="this.style.display='none'">
        <div class="sp-w-score-nums">
          <span class="sp-w-score-num">${data.teamScore}</span>
          <span class="sp-w-score-vs">|</span>
          <span class="sp-w-score-num opp">${data.oppScore}</span>
        </div>
        ${data.opponent !== '—' ? `<img class="sp-w-team-logo" src="${teamLogo(data.opponent)}" alt="${data.opponent}" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="sp-w-score-detail">${liveDot}${data.status}${liveText}</div>
      ${boxHtml}
    </div>`
}

// ── Headlines ───────────────────────────────────────────
export function renderHeadlines(items, teamNickname) {
  const title = teamNickname ? `${teamNickname.toUpperCase()} HEADLINES` : 'HEADLINES'

  if (!items || items.length === 0) {
    return `
      <div class="sp-w-module">
        <div class="sp-w-module-title">${title}</div>
        <div class="sp-w-headlines-list">
          <div class="sp-w-headline"><span class="sp-w-headline-text" style="opacity:0.4;font-style:italic">No headlines available</span></div>
        </div>
      </div>`
  }

  const rows = items.slice(0, 3).map((h, i) => `
    <div class="sp-w-headline">
      <span class="sp-w-headline-num">${i + 1}</span>
      <a href="${h.link}" target="_blank" rel="noreferrer">
        <span class="sp-w-headline-text">${h.title}</span>
        <span class="sp-w-headline-source">${h.source}${h.time ? ` · ${h.time}` : ''}</span>
      </a>
    </div>`
  ).join('')

  return `
    <div class="sp-w-module">
      <div class="sp-w-module-title">${title}</div>
      <div class="sp-w-headlines-list">${rows}</div>
    </div>`
}

// ── Countdown ───────────────────────────────────────────
export function renderCountdown(nextGame, countdown, isLive, teamNickname) {
  const opponent = nextGame?.opponent ? ` vs ${nextGame.opponent}` : ''
  const header = `Next ${teamNickname || ''} Game${opponent}`

  let body
  if (isLive) {
    body = `<div class="sp-w-countdown-live"><span class="sp-w-live-dot"></span>LIVE NOW! <a href="https://www.mlb.tv" target="_blank" rel="noreferrer">Watch on MLB.TV</a></div>`
  } else if (countdown) {
    body = `
      <div class="sp-w-countdown-display">
        <div class="sp-w-countdown-unit"><span class="sp-w-countdown-num">${countdown.d}</span><span class="sp-w-countdown-label">Days</span></div>
        <span class="sp-w-countdown-sep">:</span>
        <div class="sp-w-countdown-unit"><span class="sp-w-countdown-num">${countdown.h}</span><span class="sp-w-countdown-label">Hrs</span></div>
        <span class="sp-w-countdown-sep">:</span>
        <div class="sp-w-countdown-unit"><span class="sp-w-countdown-num">${countdown.m}</span><span class="sp-w-countdown-label">Mins</span></div>
        <span class="sp-w-countdown-sep">:</span>
        <div class="sp-w-countdown-unit"><span class="sp-w-countdown-num">${countdown.s}</span><span class="sp-w-countdown-label">Secs</span></div>
      </div>`
  } else {
    body = `<div class="sp-w-countdown-empty">No upcoming game scheduled</div>`
  }

  return `
    <div class="sp-w-module sp-w-countdown">
      <div class="sp-w-countdown-header">${header}</div>
      ${body}
    </div>`
}

// ── Standings ───────────────────────────────────────────
export function renderStandings(teams, division, teamId) {
  const title = division ? division.toUpperCase() : 'STANDINGS'

  if (!teams || teams.length === 0) {
    return `
      <div class="sp-w-module">
        <div class="sp-w-module-title">${title}</div>
        <div class="sp-w-standings-empty">Standings not available yet</div>
      </div>`
  }

  const headerRow = `
    <div class="sp-w-standings-row sp-w-standings-header">
      <div class="sp-w-st-team">Team</div>
      <div class="sp-w-st-num">W</div>
      <div class="sp-w-st-num">L</div>
      <div class="sp-w-st-num">PCT</div>
      <div class="sp-w-st-num">GB</div>
    </div>`

  const dataRows = teams.map(row => {
    const hl = row.teamId === teamId ? ' highlight' : ''
    const logo = row.abbreviation ? `<img src="${teamLogo(row.abbreviation)}" alt="" onerror="this.style.display='none'">` : ''
    return `
      <div class="sp-w-standings-row sp-w-standings-data${hl}">
        <div class="sp-w-st-team">${logo}<span>${row.team}</span></div>
        <div class="sp-w-st-num">${row.w}</div>
        <div class="sp-w-st-num">${row.l}</div>
        <div class="sp-w-st-num">${row.pct}</div>
        <div class="sp-w-st-num">${row.gb}</div>
      </div>`
  }).join('')

  return `
    <div class="sp-w-module">
      <div class="sp-w-module-title">${title}</div>
      ${headerRow}
      ${dataRows}
    </div>`
}

// ── Loading skeleton ────────────────────────────────────
export function renderLoading() {
  return `
    <div class="sp-w-module" style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px">
      <div class="sp-w-skeleton" style="width:44px;height:44px;border-radius:50%"></div>
      <div class="sp-w-skeleton" style="width:80px;height:20px"></div>
      <div class="sp-w-skeleton" style="width:120px;height:10px"></div>
    </div>`
}
