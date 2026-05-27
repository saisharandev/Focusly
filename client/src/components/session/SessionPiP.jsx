import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useActiveSession } from '../../context/ActiveSessionContext'

function formatTime(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60)
  const s = Math.max(0, seconds) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SessionPiP() {
  const navigate = useNavigate()
  const { session, isMinimized, endMinimizedSession } = useActiveSession()
  const [remaining, setRemaining] = useState(0)
  const [isEnding, setIsEnding] = useState(false)

  useEffect(() => {
    if (!session) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000)
      setRemaining(Math.max(0, session.duration * 60 - elapsed))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [session])

  if (!isMinimized) return null

  async function handleEnd() {
    setIsEnding(true)
    await endMinimizedSession()
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <div className="bg-bg-surface border border-accent-teal/30 rounded-2xl shadow-2xl overflow-hidden min-w-[220px]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-accent-teal uppercase tracking-wider">
            Session in progress
          </span>
          <button
            onClick={handleEnd}
            disabled={isEnding}
            className="text-text-muted hover:text-accent-red transition-colors p-0.5 rounded"
            title="End session"
          >
            <X size={13} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 flex items-center gap-4">
          {/* Timer */}
          <div className="text-2xl font-mono font-bold text-text-primary tabular-nums">
            {formatTime(remaining)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Subject */}
            <p className="text-xs font-medium text-text-secondary truncate">
              {session.subject}
            </p>
            {/* Return button */}
            <button
              onClick={() => navigate('/session/active')}
              className="mt-1.5 flex items-center gap-1 text-xs text-accent-teal hover:text-accent-teal/80 font-medium transition-colors"
            >
              <Play size={11} />
              Return to session
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
