import { useState, useEffect, useCallback } from 'react'
import { getTeamById } from '../data/teams'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'scoreporch_team'

// Team limits by tier
const TEAM_LIMITS = { free: 1, premium: 5, pro: 30 }

// Manages team selection + persistence (localStorage + Supabase sync)
export function useTeam(userId = null, tier = 'free') {
  const [teamId, setTeamId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? parseInt(saved, 10) : null
    } catch { return null }
  })

  const team = teamId ? getTeamById(teamId) : null
  const teamLimit = TEAM_LIMITS[tier] || 1

  // Sync team selection from Supabase profile on mount
  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('primary_team_id')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.primary_team_id) {
          setTeamId(data.primary_team_id)
          try { localStorage.setItem(STORAGE_KEY, String(data.primary_team_id)) } catch {}
        }
      })
  }, [userId])

  const selectTeam = useCallback(async (id) => {
    setTeamId(id)
    try { localStorage.setItem(STORAGE_KEY, String(id)) } catch {}

    // Persist to Supabase if logged in
    if (userId) {
      await supabase
        .from('profiles')
        .update({ primary_team_id: id })
        .eq('id', userId)
    }
  }, [userId])

  const clearTeam = useCallback(async () => {
    setTeamId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}

    if (userId) {
      await supabase
        .from('profiles')
        .update({ primary_team_id: null })
        .eq('id', userId)
    }
  }, [userId])

  // Apply team colors as CSS variables when team changes
  useEffect(() => {
    if (!team) return
    const root = document.documentElement
    root.style.setProperty('--team-primary', team.colors.primary)
    root.style.setProperty('--team-secondary', team.colors.secondary)
    root.style.setProperty('--team-accent', team.colors.accent)
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

  return { teamId, team, selectTeam, clearTeam, hasTeam: !!team, teamLimit }
}
