import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import TechnicianLog from './pages/TechnicianLog'
import SupervisorDashboard from './pages/SupervisorDashboard'
import PendingTasks from './pages/PendingTasks'
import ReloadPrompt from './components/ReloadPrompt'
import type { User } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-900">
        <div className="text-industrial-300 text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <Router>
      <ReloadPrompt />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/technician" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/technician"
          element={user ? <TechnicianLog /> : <Navigate to="/login" />}
        />
        <Route
          path="/supervisor"
          element={user ? <SupervisorDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/tasks"
          element={user ? <PendingTasks /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}

export default App
