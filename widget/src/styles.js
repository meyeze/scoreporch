// All widget CSS as a string — injected into Shadow DOM for full isolation
export default function getStyles(teamPrimary, teamSecondary) {
  const primary = teamPrimary || '#5176AB'
  const secondary = teamSecondary || '#1a1a2e'

  // Generate alpha variants
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
  }
  const pRgb = hexToRgb(primary)

  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #d5dbe6;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .sp-widget {
      background: rgba(8, 12, 21, 0.95);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      overflow: hidden;
    }

    /* ── Module base ── */
    .sp-w-module {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 12px;
    }

    .sp-w-module-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }

    /* ── Score Card ── */
    .sp-w-score {
      border-color: rgba(${pRgb}, 0.2);
      text-align: center;
    }

    .sp-w-score-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .sp-w-team-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .sp-w-score-nums {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sp-w-score-num {
      font-size: 22px;
      font-weight: 800;
      color: #d5dbe6;
      line-height: 1;
    }

    .sp-w-score-num.opp { color: rgba(255,255,255,0.5); }

    .sp-w-score-vs {
      font-size: 16px;
      color: rgba(255,255,255,0.25);
      font-weight: 300;
    }

    .sp-w-score-detail {
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      margin-top: 4px;
    }

    .sp-w-score-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px;
    }

    .sp-w-score-empty img { opacity: 0.3; }

    /* ── Box Score ── */
    .sp-w-boxscore {
      width: 100%;
      max-height: 150px;
      overflow-y: auto;
      margin-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.06);
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.12) transparent;
    }

    .sp-w-boxscore table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      table-layout: fixed;
    }

    .sp-w-boxscore thead { position: sticky; top: 0; z-index: 1; }

    .sp-w-boxscore th {
      background: rgba(8,12,21,0.98);
      color: rgba(255,255,255,0.35);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 7.5px;
      letter-spacing: 0.04em;
      padding: 4px 2px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .sp-w-boxscore th:first-child { text-align: left; padding-left: 4px; width: 52%; }

    .sp-w-boxscore td {
      padding: 3px 2px;
      text-align: center;
      color: rgba(255,255,255,0.55);
      font-size: 8.5px;
      font-variant-numeric: tabular-nums;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .sp-w-boxscore td:first-child {
      text-align: left;
      padding-left: 4px;
      color: #d5dbe6;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sp-w-bs-pos { color: rgba(255,255,255,0.35); font-weight: 400; font-size: 7.5px; margin-left: 2px; }

    .sp-w-boxscore tbody tr:hover { background: rgba(255,255,255,0.03); }

    /* ── Headlines ── */
    .sp-w-headlines-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sp-w-headline {
      display: flex;
      gap: 6px;
      align-items: flex-start;
    }

    .sp-w-headline-num {
      font-size: 10px;
      font-weight: 700;
      color: ${primary};
      min-width: 14px;
      flex-shrink: 0;
    }

    .sp-w-headline a {
      display: flex;
      flex-direction: column;
      gap: 1px;
      text-decoration: none;
      min-width: 0;
      transition: opacity 0.15s ease;
    }

    .sp-w-headline a:hover { opacity: 0.7; }

    .sp-w-headline-text {
      font-size: 10px;
      color: #d5dbe6;
      line-height: 1.35;
    }

    .sp-w-headline-source {
      font-size: 8px;
      color: rgba(255,255,255,0.35);
    }

    /* ── Countdown ── */
    .sp-w-countdown {
      border-color: rgba(${pRgb}, 0.2);
      text-align: center;
    }

    .sp-w-countdown-header {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }

    .sp-w-countdown-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .sp-w-countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .sp-w-countdown-num {
      font-size: 22px;
      font-weight: 800;
      color: #d5dbe6;
      line-height: 1;
    }

    .sp-w-countdown-label {
      font-size: 8px;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sp-w-countdown-sep {
      font-size: 18px;
      font-weight: 300;
      color: rgba(255,255,255,0.25);
      margin: 0 2px;
      align-self: flex-start;
      margin-top: 2px;
    }

    .sp-w-countdown-live {
      font-size: 13px;
      font-weight: 700;
      color: #22c55e;
    }

    .sp-w-countdown-live a { color: #22c55e; text-decoration: none; }
    .sp-w-countdown-live a:hover { text-decoration: underline; }

    .sp-w-countdown-empty {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      padding: 4px;
    }

    /* ── Standings ── */
    .sp-w-standings-row {
      display: grid;
      grid-template-columns: 2fr 0.5fr 0.5fr 0.6fr 0.5fr;
      gap: 4px;
      padding: 4px 0;
      align-items: center;
    }

    .sp-w-standings-header {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 2px;
    }

    .sp-w-standings-header .sp-w-st-team,
    .sp-w-standings-header .sp-w-st-num {
      font-weight: 600;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.05em;
    }

    .sp-w-standings-data {
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .sp-w-standings-data:last-child { border-bottom: none; }

    .sp-w-standings-data.highlight {
      background: rgba(${pRgb}, 0.08);
      border-radius: 4px;
      padding: 4px;
    }

    .sp-w-st-team {
      font-size: 10px;
      color: #d5dbe6;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
    }

    .sp-w-st-team img {
      width: 18px;
      height: 18px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .sp-w-st-team span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sp-w-st-num {
      font-size: 10px;
      color: rgba(255,255,255,0.55);
      text-align: center;
    }

    .sp-w-standings-empty {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      padding: 10px 4px;
      text-align: center;
    }

    /* ── Live dot ── */
    .sp-w-live-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      margin-right: 4px;
      vertical-align: middle;
      animation: spLivePulse 1.5s ease-in-out infinite;
    }

    @keyframes spLivePulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      50% { opacity: 0.8; box-shadow: 0 0 8px 2px rgba(34, 197, 94, 0.2); }
    }

    /* ── Score + Headlines side by side on wider containers ── */
    .sp-w-top-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    @container sp-container (min-width: 480px) {
      .sp-w-top-row {
        flex-direction: row;
      }
      .sp-w-top-row > * {
        flex: 1;
        min-width: 0;
      }
    }

    /* ── Container query setup ── */
    .sp-widget {
      container-name: sp-container;
      container-type: inline-size;
    }

    @container sp-container (max-width: 300px) {
      .sp-w-score-num { font-size: 18px; }
      .sp-w-countdown-num { font-size: 18px; }
      .sp-w-team-logo { width: 32px; height: 32px; }
    }

    /* ── Branding footer ── */
    .sp-w-branding {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.04);
    }

    .sp-w-branding a {
      font-size: 8px;
      color: rgba(255,255,255,0.25);
      text-decoration: none;
      letter-spacing: 0.04em;
      transition: color 0.15s;
    }

    .sp-w-branding a:hover { color: rgba(255,255,255,0.5); }

    /* ── Error state ── */
    .sp-w-error {
      text-align: center;
      padding: 20px 12px;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }

    .sp-w-error a { color: ${primary}; text-decoration: none; }
    .sp-w-error a:hover { text-decoration: underline; }

    /* ── Loading skeleton ── */
    .sp-w-skeleton {
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      animation: spShimmer 1.5s ease-in-out infinite;
    }

    @keyframes spShimmer {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.3; }
    }
  `
}
