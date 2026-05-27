import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Smartphone } from 'lucide-react'

export default function DistractionWarning({ isVisible, reason = 'absent' }) {
  const isPhone = reason === 'phone'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="distraction-warning"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-accent-red/10 border border-accent-red/40 backdrop-blur-xl rounded-2xl p-4 flex items-start gap-3 shadow-2xl"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {isPhone
            ? <Smartphone size={20} className="text-accent-red flex-shrink-0 mt-0.5" />
            : <AlertTriangle size={20} className="text-accent-red flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className="font-semibold text-text-primary text-sm">
              {isPhone ? 'Phone detected!' : 'Hey, are you still there?'}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {isPhone ? 'Put the phone down and stay focused.' : 'Get back to your session!'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
