import { useState, useEffect, useRef, useCallback } from 'react'
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

export default function SessionActive() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  // Guard: if navigated directly without setup
  useEffect(() => {
    if (!state) navigate('/session/new')
  }, [state, navigate])

  if (!state) return null

  const { subject, goal, duration, timerMode, cameraEnabled } = state

  const videoRef = useRef(null)
  const sessionIdRef = useRef(null)
  const focusedSecondsRef = useRef(0)
  const totalSecondsRef = useRef(0)
  const prevFocusStateRef = useRef(null)

  const [focusState, setFocusState] = useState('focused')
  const [focusScore, setFocusScore] = useState(100)
  const [distractionCount, setDistractionCount] = useState(0)
  const [noFaceStart, setNoFaceStart] = useState(null)
  const [isEnding, setIsEnding] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [sessionData, setSessionData] = useState(null)

  const sessionTimer = useSessionTimer()
  const { faceDetected, isLoaded: cameraLoaded } = useFaceDetection(videoRef, { enabled: cameraEnabled })

  // Start session on mount
  useEffect(() => {
    api.post('/api/sessions', {
      subject,
      goal,
      plannedDuration: duration,
      timerMode,
      cameraUsed: cameraEnabled,
    }).then(res => {
      sessionIdRef.current = res.data.sessionId
      sessionTimer.start()
    }).catch(console.error)

    return () => sessionTimer.stop()
  }, [])

  // Update focus state every time faceDetected changes (every 3s from hook)
  useEffect(() => {
    if (!cameraEnabled) {
      setFocusState('untracked')
      return
    }

    totalSecondsRef.current += 3

    if (faceDetected) {
      focusedSecondsRef.current += 3
      setFocusState('focused')
      setNoFaceStart(null)
    } else {
      const now = Date.now()
      const start = noFaceStart || now
      if (!noFaceStart) setNoFaceStart(now)

      const elapsed = now - start
      if (elapsed < 10_000) {
        setFocusState('idle')
      } else {
        if (prevFocusStateRef.current !== 'distracted') {
          setDistractionCount(c => c + 1)
        }
        setFocusState('distracted')
      }
    }

    prevFocusStateRef.current = focusState

    if (totalSecondsRef.current > 0) {
      const score = Math.round((focusedSecondsRef.current / totalSecondsRef.current) * 100)
      setFocusScore(Math.max(0, Math.min(100, score)))
    }
  }, [faceDetected])

  async function endSession(status = 'completed') {
    if (!sessionIdRef.current || isEnding) return
    setIsEnding(true)

    const actualDuration = Math.round(sessionTimer.elapsedSeconds / 60)

    try {
      const res = await api.patch(`/api/sessions/${sessionIdRef.current}/end`, {
        actualDuration,
        focusScore: cameraEnabled ? focusScore : 100,
        distractionCount,
        status,
      })
      setSessionData(res.data.session)
      setShowReport(true)
    } catch (err) {
      console.error('Failed to end session:', err)
      navigate('/dashboard')
    }
  }

  const isPomodoro = timerMode === 'pomodoro'

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
        status={cameraEnabled ? focusState : 'untracked'}
        focusScore={cameraEnabled ? focusScore : undefined}
        elapsedSeconds={sessionTimer.elapsedSeconds}
        distractionCount={distractionCount}
      />

      {/* Webcam preview */}
      <div className="absolute bottom-6 left-6">
        <WebcamPreview enabled={cameraEnabled} videoRef={videoRef} />
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
      <DistractionWarning isVisible={cameraEnabled && focusState === 'distracted'} />

      {/* Session report modal */}
      <SessionReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        session={sessionData}
      />
    </div>
  )
}
