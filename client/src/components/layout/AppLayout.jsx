import { AnimatePresence, motion } from 'framer-motion'
import { Zap, X } from 'lucide-react'
import Sidebar from './Sidebar'
import FloatingMusicPlayer from '../music/FloatingMusicPlayer'
import SessionPiP from '../session/SessionPiP'
import { useBattle } from '../../context/BattleContext'

function BattleBanner() {
  const { incoming, pending, notification, acceptChallenge, rejectChallenge } = useBattle()

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          key="incoming"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-surface border border-accent-amber/40 shadow-xl shadow-black/40"
        >
          <Zap size={16} className="text-accent-amber fill-accent-amber flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-tight">
              {incoming.challengerName} challenged you!
            </p>
            <p className="text-xs text-text-muted">25-min focus battle</p>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={acceptChallenge}
              className="px-3 py-1.5 rounded-lg bg-accent-teal text-bg-base text-xs font-bold hover:bg-accent-teal/90 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={rejectChallenge}
              className="p-1.5 rounded-lg bg-white/10 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}

      {pending && !incoming && (
        <motion.div
          key="pending"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-surface border border-white/10 shadow-xl shadow-black/40"
        >
          <Zap size={14} className="text-accent-amber animate-pulse" />
          <p className="text-sm text-text-secondary">Waiting for opponent to accept…</p>
        </motion.div>
      )}

      {notification?.type === 'rejected' && (
        <motion.div
          key="rejected"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-surface border border-white/10 shadow-xl shadow-black/40"
        >
          <p className="text-sm text-text-muted">Challenge was declined.</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen p-6 pt-16 lg:pt-6">
        {children}
      </main>
      <FloatingMusicPlayer />
      <SessionPiP />
      <BattleBanner />
    </div>
  )
}
