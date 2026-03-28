import React, { useState, useEffect } from 'react'
import './EmbedCallout.css'

const DISMISSED_KEY = 'sp-embed-callout-dismissed'

export default function EmbedCallout() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {}
    // Small delay so it animates in after page loads
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = (e) => {
    e.stopPropagation()
    setVisible(false)
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  if (!visible) return null

  return (
    <div className="embed-callout">
      <div className="embed-callout-arrow" />
      <div className="embed-callout-body">
        <button className="embed-callout-close" onClick={dismiss}>&times;</button>
        <span className="embed-callout-badge">NEW</span>
        <span className="embed-callout-text">Add to your website!</span>
      </div>
    </div>
  )
}
