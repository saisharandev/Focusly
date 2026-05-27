import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Square } from 'lucide-react'
import api from '../../lib/api'
import usePomodoroTimer from '../../hooks/usePomodoroTimer'
import useSessionTimer from '../../hooks/useSessionTimer'
import useFaceDetection from '../../hooks/useFaceDetection'
import CircularTimer from '../../components/session/CircularTimer'
import PomodoroTimer from '../../components/pomodoro/PomodoroTimer'
import WebcamPreview from '../../components/session/WebcamPreview'
import FocusStatus from '../../components/session/FocusStatus'
import DistractionWarning from '../../components/session/DistractionWarning'
import SessionReport from '../../components/session/SessionReport'
import Button from '../../components/ui/Button'
import AchievementToast from '../../components/ui/AchievementToast'

export default function SessionActive() {
  const location = useLocation()
  const navigate = useNavigate()

  // Restore from sessionStorage on refresh so state survives
  const state = useMemo(() => {
    if (location.state) return location.state
    try { return JSON.parse(sessionStorage.getItem('activeSession') || 'null') } catch { return null }
  }, [])

  const { subject = '', goal = '', duration = 25, timerMode = 'pomodoro', cameraEnabled = true } = state || {}

  const videoRef = useRef(null)
  const sessionIdRef = useRef(null)
  const focusedSecondsRef = useRef(0)
  const totalSecondsRef = useRef(0)
  const prevFocusStateRef = useRef(null)
  const noFaceStartRef = useRef(null)

  const [focusState, setFocusState] = useState('idle')
  const [focusScore, setFocusScore] = useState(100)
  const [distractionCount, setDistractionCount] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [sessionData, setSessionData] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])

  const sessionTimer = useSessionTimer()
  const { faceDetectedRef, phoneDetectedRef, isLoaded: cameraLoaded } = useFaceDetection(videoRef, { enabled: !!state && cameraEnabled })

  // Guard: redirect if no session state at all
  useEffect(() => {
    if (!state) navigate('/session/new')
  }, [state, navigate])

  // Start or resume session
  useEffect(() => {
    if (!state) return

    const storedId = sessionStorage.getItem('activeSessionId')
    const storedStart = sessionStorage.getItem('activeSessionStart')

    if (storedId && storedStart) {
      // Resuming after refresh — reuse existing session
      sessionIdRef.current = storedId
      const elapsed = Math.floor((Date.now() - Number(storedStart)) / 1000)
      sessionTimer.startFrom(Math.max(0, elapsed))
    } else {
      // Fresh session
      api.post('/api/sessions', {
        subject,
        goal,
        plannedDuration: duration,
        timerMode,
        cameraUsed: cameraEnabled,
      }).then(res => {
        sessionIdRef.current = res.data.sessionId
        sessionStorage.setItem('activeSessionId', res.data.sessionId)
        sessionStorage.setItem('activeSessionStart', String(Date.now()))
        sessionTimer.start()
      }).catch(console.error)
    }

    return () => sessionTimer.stop()
  }, [])

  // Focus state machine — runs every 3s on its own interval, reads faceDetectedRef
  useEffect(() => {
    if (!cameraEnabled) {
      setFocusState('untracked')
      return
    }
    const interval = setInterval(() => {
      totalSecondsRef.current += 3
      const phone = phoneDetectedRef.current
      const face = faceDetectedRef.current

      if (phone) {
        // Phone in frame → immediately distracted regardless of face
        if (prevFocusStateRef.current !== 'distracted') {
          setDistractionCount(c => c + 1)
        }
        prevFocusStateRef.current = 'distracted'
        setFocusState('phone')
        noFaceStartRef.current = null
      } else if (face) {
        focusedSecondsRef.current += 3
        prevFocusStateRef.current = 'focused'
        setFocusState('focused')
        noFaceStartRef.current = null
      } else {
        const now = Date.now()
        if (!noFaceStartRef.current) noFaceStartRef.current = now
        const elapsed = now - noFaceStartRef.current
        if (elapsed < 10_000) {
          prevFocusStateRef.current = 'idle'
          setFocusState('idle')
        } else {
          if (prevFocusStateRef.current !== 'distracted') {
            setDistractionCount(c => c + 1)
          }
          prevFocusStateRef.current = 'distracted'
          setFocusState('distracted')
        }
      }
      if (totalSecondsRef.current > 0) {
        setFocusScore(Math.round((focusedSecondsRef.current / totalSecondsRef.current) * 100))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [cameraEnabled])

  async function endSession(status = 'completed') {
    if (!sessionIdRef.current || isEnding) return
    setIsEnding(true)
    sessionStorage.removeItem('activeSession')
    sessionStorage.removeItem('activeSessionId')
    sessionStorage.removeItem('activeSessionStart')

    const actualDuration = Math.round(sessionTimer.elapsedSeconds / 60)

    try {
      const res = await api.patch(`/api/sessions/${sessionIdRef.current}/end`, {
        actualDuration,
        focusScore: cameraEnabled ? focusScore : 100,
        distractionCount,
        status,
      })
      setSessionData(res.data.session)
      setNewAchievements(res.data.newAchievements || [])
      setShowReport(true)
    } catch (err) {
      console.error('Failed to end session:', err)
      navigate('/dashboard')
    }
  }

  const isPomodoro = timerMode === 'pomodoro'

  if (!state) return null

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 relative">
      {/* Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="px-3 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/30 text-accent-teal text-sm font-medium">
          {subject}
        </span>
        {cameraEnabled && (
          <span className="text-sm text-text-muted">
            Focus: <span className="text-text-primary font-semibold">{focusScore}%</span>
          </span>
        )}
      </div>

      {/* Timer */}
      <div className="mt-12 mb-8">
        {isPomodoro ? (
          <PomodoroTimer
            workDuration={duration}
            focusState={cameraEnabled ? focusState : 'neutral'}
            onStart={() => {}}
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <CircularTimer
              remaining={Math.max(0, duration * 60 - sessionTimer.elapsedSeconds)}
              totalDuration={duration * 60}
              phase="WORKING"
              focusState={cameraEnabled ? focusState : 'neutral'}
            />
          </div>
        )}
      </div>

      {/* Focus status bar */}
      <FocusStatus
        status={cameraEnabled ? (focusState === 'phone' ? 'distracted' : focusState) : 'untracked'}
        focusScore={cameraEnabled ? focusScore : undefined}
        elapsedSeconds={sessionTimer.elapsedSeconds}
        distractionCount={distractionCount}
      />

      {/* Webcam preview */}
      <div className="absolute bottom-6 left-6">
        <WebcamPreview
          enabled={cameraEnabled}
          videoRef={videoRef}
          focusState={focusState}
          phoneDetected={focusState === 'phone'}
        />
      </div>

      {/* End session button */}
      <div className="absolute bottom-6 right-6">
        <Button
          variant="danger"
          size="md"
          onClick={() => endSession('completed')}
          isLoading={isEnding}
        >
          <Square size={16} />
          End Session
        </Button>
      </div>

      {/* Distraction warning */}
      <DistractionWarning
        isVisible={cameraEnabled && (focusState === 'distracted' || focusState === 'phone')}
        reason={focusState === 'phone' ? 'phone' : 'absent'}
      />

      {/* Session report modal */}
      <SessionReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        session={sessionData}
      />

      <AchievementToast achievements={newAchievements} />
    </div>
  )
}
