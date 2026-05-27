import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import useFaceDetection from '../hooks/useFaceDetection'
import WebcamPreview from '../components/session/WebcamPreview'

function FocusRing({ score, color, size = 120 }) {
  const radius = (size - 16) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function FocusBattle() {
  const { battleId } = useParams()
  const { state } = useLocation()
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  const opponentId = state?.opponentId
  const opponentName = state?.opponentName || 'Opponent'
  const duration = state?.duration || 25 * 60 * 1000
  const battleStartedAt = state?.startedAt || Date.now()

  const [myFocus, setMyFocus] = useState(0)
  const [opponentFocus, setOpponentFocus] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.round((duration - (Date.now() - battleStartedAt)) / 1000)))
  const [phase, setPhase] = useState('active')  // 'active' | 'ended'
  const [winner, setWinner] = useState(null)
  const [finalFocus, setFinalFocus] = useState(null)
  const focusedSecondsRef = useRef(0)
  const totalSecondsRef = useRef(0)

  const { faceDetectedRef } = useFaceDetection(videoRef, { enabled: true })
  const myId = user?._id || user?.id

  // Guard: if no battle state (e.g. page refresh), go back
  useEffect(() => {
    if (!state?.battleId && !battleId) navigate('/leaderboard')
  }, [])

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((duration - (Date.now() - battleStartedAt)) / 1000))
      setTimeLeft(left)
    }, 1000)
    return () => clearInterval(interval)
  }, [duration, battleStartedAt])

  // Track + broadcast focus every 3s
  useEffect(() => {
    if (!socket) return
    const interval = setInterval(() => {
      totalSecondsRef.current += 3
      if (faceDetectedRef.current) focusedSecondsRef.current += 3
      const score = totalSecondsRef.current > 0
        ? Math.round((focusedSecondsRef.current / totalSecondsRef.current) * 100)
        : 0
      setMyFocus(score)
      socket.emit('battle:focus_update', { battleId, focusScore: score })
    }, 3000)
    return () => clearInterval(interval)
  }, [socket, battleId])

  // Socket events
  useEffect(() => {
    if (!socket) return

    socket.on('battle:score_update', ({ userId, focusScore }) => {
      if (userId === opponentId) setOpponentFocus(focusScore)
    })

    socket.on('battle:ended', ({ winnerId, focus }) => {
      setPhase('ended')
      setWinner(winnerId)
      setFinalFocus(focus)
    })

    return () => {
      socket.off('battle:score_update')
      socket.off('battle:ended')
    }
  }, [socket, opponentId])

  function forfeit() {
    socket?.emit('battle:forfeit', { battleId })
    navigate('/leaderboard')
  }

  const isWinner = winner === myId
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const isLeading = myFocus >= opponentFocus

  if (phase === 'ended') {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center space-y-3">
          <div className="text-7xl mb-4">{isWinner ? '🏆' : '💪'}</div>
          <h1 className="text-3xl font-bold text-text-primary">
            {isWinner ? 'You Won!' : 'Better luck next time!'}
          </h1>
          <p className="text-text-muted text-sm">25-minute focus battle complete</p>
        </div>

        <div className="flex gap-20">
          <div className="text-center space-y-1">
            <p className={`text-5xl font-bold ${isWinner ? 'text-accent-teal' : 'text-text-secondary'}`}>
              {finalFocus?.[myId] ?? myFocus}%
            </p>
            <p className="text-sm text-text-muted">Your focus</p>
            {isWinner && <p className="text-xs text-accent-teal font-semibold">Winner</p>}
          </div>
          <div className="text-center space-y-1">
            <p className={`text-5xl font-bold ${!isWinner ? 'text-accent-teal' : 'text-text-secondary'}`}>
              {finalFocus?.[opponentId] ?? opponentFocus}%
            </p>
            <p className="text-sm text-text-muted">{opponentName}</p>
            {!isWinner && <p className="text-xs text-accent-teal font-semibold">Winner</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-6 py-2.5 rounded-xl bg-white/10 text-text-primary text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Back to Leaderboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-10 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-accent-amber fill-accent-amber" />
        <span className="text-base font-bold text-text-primary">Focus Battle</span>
        <Zap size={18} className="text-accent-amber fill-accent-amber" />
      </div>

      {/* Timer */}
      <div className="text-5xl font-bold font-mono text-text-primary tabular-nums">
        {mins}:{secs}
      </div>

      {/* Status pill */}
      {myFocus > 0 && (
        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
          isLeading
            ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/30'
            : 'bg-accent-red/15 text-accent-red border border-accent-red/30'
        }`}>
          {isLeading ? "You're winning!" : `${opponentName} is ahead`}
        </div>
      )}

      {/* Focus rings */}
      <div className="flex items-center gap-16">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <FocusRing score={myFocus} color="#14B8A6" size={140} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">{myFocus}%</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-accent-teal">You</span>
        </div>

        <span className="text-2xl font-bold text-text-muted/40">vs</span>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <FocusRing score={opponentFocus} color="#A855F7" size={140} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">{opponentFocus}%</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-accent-purple">{opponentName}</span>
        </div>
      </div>

      {/* Forfeit */}
      <button
        onClick={forfeit}
        className="text-xs text-text-muted hover:text-accent-red transition-colors mt-4"
      >
        Forfeit battle
      </button>

      {/* Camera (hidden video, visible preview in corner) */}
      <div className="fixed bottom-6 left-6">
        <WebcamPreview enabled videoRef={videoRef} focusState={faceDetectedRef.current ? 'focused' : 'idle'} />
      </div>
    </div>
  )
}
