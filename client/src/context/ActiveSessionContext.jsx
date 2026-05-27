import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../lib/api'

const ActiveSessionContext = createContext(null)

export function ActiveSessionProvider({ children }) {
  const location = useLocation()
  const [session, setSession] = useState(null)

  function readFromStorage() {
    const sessionId = sessionStorage.getItem('activeSessionId')
    const startedAt = sessionStorage.getItem('activeSessionStart')
    const raw = sessionStorage.getItem('activeSession')
    if (!sessionId || !startedAt || !raw) {
      setSession(null)
      return
    }
    try {
      const { subject, duration, timerMode } = JSON.parse(raw)
      setSession({ sessionId, startedAt: Number(startedAt), subject, duration, timerMode })
    } catch {
      setSession(null)
    }
  }

  // Re-read on every route change — picks up when user navigates away from /session/active
  useEffect(() => {
    readFromStorage()
  }, [location.pathname])

  const endMinimizedSession = useCallback(async () => {
    if (!session) return
    const elapsed = Math.round((Date.now() - session.startedAt) / 1000)
    const actualDuration = Math.max(1, Math.round(elapsed / 60))
    try {
      await api.patch(`/api/sessions/${session.sessionId}/end`, {
        actualDuration,
        focusScore: 100,
        distractionCount: 0,
        status: 'completed',
      })
    } catch (err) {
      console.error('Failed to end minimized session:', err)
    } finally {
      sessionStorage.removeItem('activeSession')
      sessionStorage.removeItem('activeSessionId')
      sessionStorage.removeItem('activeSessionStart')
      setSession(null)
    }
  }, [session])

  // isMinimized = session exists AND we are NOT on the session page
  const isMinimized = !!session && location.pathname !== '/session/active'

  return (
    <ActiveSessionContext.Provider value={{ session, isMinimized, endMinimizedSession }}>
      {children}
    </ActiveSessionContext.Provider>
  )
}

export function useActiveSession() {
  return useContext(ActiveSessionContext)
}
