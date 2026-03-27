import { useState, useEffect, useRef } from 'react'

// Polling data hook — fetches URL on mount and at interval
export function useApi(url, options = {}) {
  const { interval = 60000 } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const urlRef = useRef(url)

  // Update ref when URL changes
  useEffect(() => { urlRef.current = url }, [url])

  useEffect(() => {
    if (!url) { setLoading(false); return }

    let active = true

    async function fetchData() {
      try {
        const res = await fetch(urlRef.current)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (active) { setData(json); setError(null) }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    const timer = setInterval(fetchData, interval)
    return () => { active = false; clearInterval(timer) }
  }, [url, interval])

  return { data, error, loading }
}
