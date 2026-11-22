import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Assignments from './components/Assignments'
import Expenses from './components/Expenses'
import Layout from './components/Layout'

type Page = 'dashboard' | 'assignments' | 'expenses'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <Layout page={page} setPage={setPage} user={session.user}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'assignments' && <Assignments />}
      {page === 'expenses' && <Expenses />}
    </Layout>
  )
}
