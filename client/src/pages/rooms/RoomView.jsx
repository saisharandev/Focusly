import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Camera, CameraOff } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import useFaceDetection from '../../hooks/useFaceDetection'
import WebcamPreview from '../../components/session/WebcamPreview'
import PomodoroTimer from '../../components/pomodoro/PomodoroTimer'
import MemberGrid from '../../components/rooms/MemberGrid'
import ChatPanel from '../../components/rooms/ChatPanel'
import HostControls from '../../components/rooms/HostControls'
import { RoomTypeBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function RoomView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const videoRef = useRef(null)

  const [room, setRoom] = useState(null)
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [timerState, setTimerState] = useState({ phase: 'IDLE', remaining: 25 * 60, cycleCount: 0, isPaused: false })
  const [chatOpen, setChatOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const joinTimeRef = useRef(Date.now())
  const currentRoomRef = useRef(id)
  const timerStartedAtRef = useRef(null)
  const timerTotalDurationRef = useRef(null)
  // Working-time tracking for session recording
  const workingSecondsRef = useRef(0)
  const focusedSecondsRef = useRef(0)
  const timerPhaseRef = useRef('IDLE')
  const timerPausedRef = useRef(false)
  const hasRecordedRef = useRef(false)
  const cameraEnabledRef = useRef(false)
  const roomSubjectRef = useRef(null)

  const { faceDetectedRef } = useFaceDetection(videoRef, { enabled: cameraEnabled })
  const focusStatus = !cameraEnabled ? 'untracked' : (faceDetectedRef.current ? 'focused' : 'idle')

  // Keep cameraEnabledRef in sync so recordRoomSession closure reads current value
  useEffect(() => { cameraEnabledRef.current = cameraEnabled }, [cameraEnabled])

  const isHost = room?.hostId?._id === user?._id || room?.hostId === user?._id

  // Load room and join via socket
  useEffect(() => {
    async function init() {
      try {
        const res = await api.get(`/api/rooms/${id}`)
        const r = res.data.room
        setRoom(r)
        roomSubjectRef.current = r.subjectTag || null
        setMembers(r.members.map(m => ({
          userId: m._id,
          name: m.name,
          avatarUrl: m.avatarUrl,
          status: 'focused',
        })))
      } catch {
        navigate('/rooms')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [id])

  // recordRoomSession — fire-and-forget safe (works even after unmount)
  async function recordRoomSession() {
    if (hasRecordedRef.current) return
    const workingMins = Math.round(workingSecondsRef.current / 60)
    if (workingMins < 1) return
    hasRecordedRef.current = true
    try {
      const focusScore = workingSecondsRef.current > 0
        ? Math.round((focusedSecondsRef.current / workingSecondsRef.current) * 100)
        : 100
      const startRes = await api.post('/api/sessions', {
        subject: roomSubjectRef.current || 'Study Room',
        plannedDuration: workingMins,
        timerMode: 'pomodoro',
        cameraUsed: cameraEnabledRef.current,
      })
      await api.patch(`/api/sessions/${startRes.data.sessionId}/end`, {
        actualDuration: workingMins,
        focusScore,
        distractionCount: 0,
        status: 'completed',
      })
    } catch (err) {
      console.error('Failed to record room session:', err)
    }
  }

  // Socket events
  useEffect(() => {
    if (!socket || !room) return

    socket.emit('join_room', id)
    currentRoomRef.current = id

    socket.on('member_joined', ({ userId, name, avatarUrl }) => {
      setMembers(prev => {
        if (prev.find(m => m.userId === userId)) return prev
        return [...prev, { userId, name, avatarUrl, status: 'focused' }]
      })
    })

    socket.on('member_left', ({ userId }) => {
      setMembers(prev => prev.filter(m => m.userId !== userId))
    })

    socket.on('host_changed', ({ newHostId }) => {
      setRoom(r => r ? { ...r, hostId: newHostId } : r)
    })

    socket.on('member_status_changed', ({ userId, status, focusScore }) => {
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, status, focusScore } : m))
    })

    socket.on('new_message', msg => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('timer:sync', payload => {
      timerPhaseRef.current = payload.phase
      timerPausedRef.current = payload.isPaused
      setTimerState(prev => ({ ...prev, ...payload }))
      // Reconstruct countdown refs from sync payload so late joiners tick correctly
      if (!payload.isPaused && payload.phase !== 'IDLE') {
        const durMap = { WORKING: payload.workDuration || 25, SHORT_BREAK: payload.shortBreak || 5, LONG_BREAK: payload.longBreak || 15 }
        const totalMs = (durMap[payload.phase] || 25) * 60 * 1000
        timerTotalDurationRef.current = totalMs
        timerStartedAtRef.current = Date.now() - (totalMs - payload.remaining * 1000)
      }
    })

    socket.on('timer:started', payload => {
      timerPhaseRef.current = payload.phase
      timerPausedRef.current = false
      timerStartedAtRef.current = payload.startedAt
      timerTotalDurationRef.current = payload.duration
      setTimerState({
        phase: payload.phase,
        remaining: Math.round(payload.duration / 1000),
        cycleCount: payload.cycleCount || 0,
        isPaused: false,
        workDuration: payload.workDuration,
        shortBreak: payload.shortBreak,
        longBreak: payload.longBreak,
      })
    })

    socket.on('timer:paused', ({ remainingAtPause }) => {
      timerPausedRef.current = true
      timerStartedAtRef.current = null
      setTimerState(prev => ({ ...prev, isPaused: true, remaining: Math.round(remainingAtPause / 1000) }))
    })

    socket.on('timer:resumed', ({ startedAt }) => {
      timerPausedRef.current = false
      timerStartedAtRef.current = startedAt
      setTimerState(prev => ({ ...prev, isPaused: false }))
    })

    socket.on('timer:skipped', payload => {
      timerPhaseRef.current = payload.phase
      timerPausedRef.current = false
      timerStartedAtRef.current = payload.startedAt
      timerTotalDurationRef.current = payload.duration
      setTimerState({ phase: payload.phase, remaining: Math.round(payload.duration / 1000), cycleCount: payload.cycleCount, isPaused: false })
    })

    socket.on('room_ended', () => navigate('/rooms'))

    // Reconnect: re-join on re-connect
    socket.on('connect', () => {
      if (currentRoomRef.current) socket.emit('join_room', currentRoomRef.current)
    })

    return () => {
      socket.emit('leave_room', id)
      recordRoomSession() // fire-and-forget; hasRecordedRef prevents double-recording
      socket.off('member_joined')
      socket.off('member_left')
      socket.off('host_changed')
      socket.off('member_status_changed')
      socket.off('new_message')
      socket.off('timer:sync')
      socket.off('timer:started')
      socket.off('timer:paused')
      socket.off('timer:resumed')
      socket.off('timer:skipped')
      socket.off('room_ended')
    }
  }, [socket, room, id])

  // Countdown: decrement remaining every second based on server startedAt
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timerStartedAtRef.current || !timerTotalDurationRef.current) return
      const elapsed = Date.now() - timerStartedAtRef.current
      const remaining = Math.max(0, Math.round((timerTotalDurationRef.current - elapsed) / 1000))
      setTimerState(prev => {
        if (prev.isPaused || prev.phase === 'IDLE') return prev
        return { ...prev, remaining }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Track working seconds every 3s — reads refs, no stale closure risk
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerPhaseRef.current === 'WORKING' && !timerPausedRef.current) {
        workingSecondsRef.current += 3
        if (cameraEnabledRef.current && faceDetectedRef.current) {
          focusedSecondsRef.current += 3
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Broadcast focus status + score every 3s — reads refs to avoid stale closures
  useEffect(() => {
    if (!socket || !room) return
    const interval = setInterval(() => {
      const status = !cameraEnabled ? 'untracked' : (faceDetectedRef.current ? 'focused' : 'idle')
      const focusScore = workingSecondsRef.current > 0
        ? Math.round((focusedSecondsRef.current / workingSecondsRef.current) * 100)
        : undefined
      socket.emit('focus_status_update', { roomId: id, status, focusScore })
    }, 3000)
    return () => clearInterval(interval)
  }, [socket, room, id, cameraEnabled])

  function sendMessage(text) {
    socket?.emit('send_message', { roomId: id, text })
  }

  async function endRoom() {
    await recordRoomSession()
    await api.delete(`/api/rooms/${id}`)
    socket?.emit('leave_room', id)
    navigate('/rooms')
  }

  function copyInvite() {
    navigator.clipboard.writeText(room.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!room) return null

  return (
    <div className="flex h-[calc(100vh-1.5rem)] -m-6 overflow-hidden">
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/8 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="font-bold text-text-primary text-lg truncate">{room.name}</h1>
            <RoomTypeBadge type={room.type} />
            {room.subjectTag && (
              <span className="text-xs text-text-muted hidden sm:block">{room.subjectTag}</span>
            )}
          </div>
          <button
            onClick={() => setCameraEnabled(c => !c)}
            title={cameraEnabled ? 'Disable camera tracking' : 'Enable camera tracking'}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              cameraEnabled
                ? 'text-accent-teal border-accent-teal/40 bg-accent-teal/10'
                : 'text-text-muted border-white/10 hover:text-text-primary'
            }`}
          >
            {cameraEnabled ? <Camera size={12} /> : <CameraOff size={12} />}
            {cameraEnabled ? 'Camera on' : 'Camera off'}
          </button>
          <button
            onClick={copyInvite}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-teal transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-accent-teal/40"
          >
            {copied ? <Check size={12} className="text-accent-teal" /> : <Copy size={12} />}
            {copied ? 'Copied!' : room.inviteCode}
          </button>
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="px-6 py-3 border-b border-white/8 flex-shrink-0">
            <HostControls
              timerPhase={timerState.phase}
              onStart={() => socket?.emit('timer:start', { roomId: id, workDuration: room.workDuration })}
              onPause={() => socket?.emit('timer:pause', { roomId: id })}
              onResume={() => socket?.emit('timer:resume', { roomId: id })}
              onSkip={() => socket?.emit('timer:skip', { roomId: id })}
              onEndRoom={endRoom}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pomodoro Timer */}
          <div className="flex justify-center">
            <PomodoroTimer
              workDuration={room.workDuration || 25}
              synced
              isHost={isHost}
              externalState={timerState}
              focusState={focusStatus}
              onStart={() => socket?.emit('timer:start', { roomId: id, workDuration: room.workDuration })}
              onPause={() => socket?.emit('timer:pause', { roomId: id })}
              onResume={() => socket?.emit('timer:resume', { roomId: id })}
              onSkip={() => socket?.emit('timer:skip', { roomId: id })}
            />
          </div>

          {/* Members */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Members ({members.length}/{room.maxMembers})
            </p>
            <MemberGrid
              members={members}
              hostId={typeof room.hostId === 'object' ? room.hostId._id : room.hostId}
              currentUserId={user?._id}
            />
          </div>
        </div>
      </div>

      {/* Webcam preview overlay */}
      {cameraEnabled && (
        <div className="absolute bottom-4 left-4 z-10">
          <WebcamPreview enabled={cameraEnabled} videoRef={videoRef} />
        </div>
      )}

      {/* Chat panel */}
      <ChatPanel
        messages={messages}
        onSend={sendMessage}
        currentUserId={user?._id}
        isCollapsed={!chatOpen}
        onToggle={() => setChatOpen(o => !o)}
      />
    </div>
  )
}
