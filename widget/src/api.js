// Widget data fetcher — polls the ScorePorch API with embed key validation

export class WidgetAPI {
  constructor(baseUrl, embedId) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.embedId = embedId
    this.timers = []
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.set('embedId', this.embedId)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

    try {
      const res = await fetch(url.toString())
      if (!res.ok) {
        if (res.status === 403) throw new Error('UNAUTHORIZED')
        throw new Error(`HTTP ${res.status}`)
      }
      return await res.json()
    } catch (err) {
      console.warn(`[ScorePorch] API error: ${err.message}`)
      return null
    }
  }

  poll(endpoint, params, interval, callback) {
    const doFetch = async () => {
      const data = await this.fetch(endpoint, params)
      if (data) callback(data)
    }
    doFetch()
    const timer = setInterval(doFetch, interval)
    this.timers.push(timer)
    return timer
  }

  destroy() {
    this.timers.forEach(t => clearInterval(t))
    this.timers = []
  }
}
