import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Handles the OAuth redirect callback (e.g., Google sign-in)
export default function AuthCallback() {
  useEffect(() => {
    // Supabase client automatically picks up the tokens from the URL hash
    // Just redirect to home after a brief moment
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-text)',
      fontSize: '14px'
    }}>
      Signing you in...
    </div>
  )
}
