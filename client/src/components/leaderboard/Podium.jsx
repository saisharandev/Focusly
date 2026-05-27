import { motion } from 'framer-motion'
import { formatDuration } from '../../lib/utils'

const RANK_COLORS = {
  1: { border: 'border-accent-amber', bg: 'bg-accent-amber/20', text: 'text-accent-amber', pedestal: 'bg-accent-amber/30', label: '🥇' },
  2: { border: 'border-text-secondary', bg: 'bg-white/10', text: 'text-text-secondary', pedestal: 'bg-white/10', label: '🥈' },
  3: { border: 'border-amber-700', bg: 'bg-amber-900/20', text: 'text-amber-600', pedestal: 'bg-amber-900/20', label: '🥉' },
}

const PEDESTAL_HEIGHTS = { 1: 'h-20', 2: 'h-14', 3: 'h-10' }

function PodiumSlot({ entry, position, delay }) {
  const c = RANK_COLORS[position]
  const initials = entry?.name?.[0]?.toUpperCase() || '?'

  return (
    <motion.div
      className="flex flex-col items-center gap-2 flex-1"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      <span className="text-xl">{c.label}</span>
      <div className={`w-14 h-14 rounded-full border-2 ${c.border} ${c.bg} flex items-center justify-center text-lg font-bold ${c.text}`}>
        {entry?.avatarUrl
          ? <img src={entry.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
          : initials}
      </div>
      <div className="text-center">
        <p className="text-text-primary text-sm font-semibold truncate max-w-[80px]">{entry?.name || '—'}</p>
        <p className="text-text-muted text-xs">{entry ? formatDuration(entry.totalMinutes) : '—'}</p>
      </div>
      <div className={`w-full ${PEDESTAL_HEIGHTS[position]} ${c.pedestal} rounded-t-lg flex items-center justify-center`}>
        <span className={`text-lg font-bold ${c.text}`}>#{position}</span>
      </div>
    </motion.div>
  )
}

export default function Podium({ entries }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
      <div className="flex items-end gap-3">
        <PodiumSlot entry={entries[1]} position={2} delay={0.1} />
        <PodiumSlot entry={entries[0]} position={1} delay={0} />
        <PodiumSlot entry={entries[2]} position={3} delay={0.2} />
      </div>
    </div>
  )
}
