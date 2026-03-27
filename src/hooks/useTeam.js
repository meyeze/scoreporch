import { useState, useEffect, useCallback } from 'react'
import { getTeamById } from '../data/teams'

const STORAGE_KEY = 'scoreporch_team'

// Manages team selection + persistence
export function useTeam() {
  const [teamId, setTeamId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? parseInt(saved, 10) : null
    } catch { return null }
  })

  const team = teamId ? getTeamById(teamId) : null

  const selectTeam = useCallback((id) => {
    setTeamId(id)
    try { localStorage.setItem(STORAGE_KEY, String(id)) } catch {}
  }, [])

  const clearTeam = useCallback(() => {
    setTeamId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  // Apply team colors as CSS variables when team changes
  useEffect(() => {
    if (!team) return
    const root = document.documentElement
    root.style.setProperty('--team-primary', team.colors.primary)
    root.style.setProperty('--team-secondary', team.colors.secondary)
    root.style.setProperty('--team-accent', team.colors.accent)
    // Generate transparent variants for backgrounds
    root.style.setProperty('--team-primary-10', team.colors.primary + '1a')
    root.style.setProperty('--team-primary-20', team.colors.primary + '33')
    root.style.setProperty('--team-primary-40', team.colors.primary + '66')
    return () => {
      root.style.removeProperty('--team-primary')
      root.style.removeProperty('--team-secondary')
      root.style.removeProperty('--team-accent')
      root.style.removeProperty('--team-primary-10')
      root.style.removeProperty('--team-primary-20')
      root.style.removeProperty('--team-primary-40')
    }
  }, [team])

  return { teamId, team, selectTeam, clearTeam, hasTeam: !!team }
}
