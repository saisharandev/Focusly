import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function AchievementToast({ achievements = [] }) {
  const [visible, setVisible] = useState(null)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    if (achievements.length > 0) {
      setQueue(achievements)
    }
  }, [achievements])

  useEffect(() => {
    if (queue.length === 0) return
    const [next, ...rest] = queue
    setVisible(next)
    const timer = setTimeout(() => {
      setVisible(null)
      setTimeout(() => setQueue(rest), 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [queue])

  if (!visible) return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999]" style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="bg-bg-surface border border-accent-teal/30 rounded-2xl p-4 flex items-center gap-4 shadow-xl min-w-[280px]">
        <span className="text-3xl">{visible.icon}</span>
        <div>
          <p className="text-xs text-accent-teal font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{visible.name}</p>
          <p className="text-xs text-text-muted">{visible.description}</p>
        </div>
      </div>
    </div>,
    document.body
  )
}
