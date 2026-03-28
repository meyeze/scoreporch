import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile (tier, team selections, etc.)
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subscriptions(*)')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    return data
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    // Safety timeout — never hang on loading for more than 6 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false)
    }, 6000)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(safetyTimer)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setSession(session)
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => {
      clearTimeout(safetyTimer)
      setLoading(false)
    })

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setSession(session)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Sign up with email
  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }, [])

  // Sign in with email
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    return { data, error }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  // Refresh profile (call after subscription changes)
  const refreshProfile = useCallback(async () => {
    if (user) return fetchProfile(user.id)
  }, [user, fetchProfile])

  // Derived state
  const tier = profile?.subscriptions?.[0]?.tier || 'free'
  const isAuthenticated = !!user
  const isPremium = tier === 'premium' || tier === 'pro'
  const isPro = tier === 'pro'

  const value = {
    user,
    session,
    profile,
    tier,
    loading,
    isAuthenticated,
    isPremium,
    isPro,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
