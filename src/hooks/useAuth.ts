import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('Existing session:', session, 'Error:', error)
      if (session) {
        setSession(session)
        setLoading(false)
      } else {
        console.log('No session, signing in anonymously...')
        const { data, error: signInError } = await supabase.auth.signInAnonymously()
        console.log('Anonymous sign in result:', data, 'Error:', signInError)
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}