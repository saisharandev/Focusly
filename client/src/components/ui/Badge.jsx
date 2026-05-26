import { clsx } from '../../lib/utils'

const ROOM_TYPE_STYLES = {
  silent:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  coding:    'bg-teal-500/20 text-teal-300 border-teal-500/30',
  exam:      'bg-red-500/20 text-red-300 border-red-500/30',
  general:   'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  late_night:'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const ROOM_TYPE_ICONS = {
  silent: '🤫', coding: '💻', exam: '📚', general: '🎯', late_night: '🌙',
}

export function RoomTypeBadge({ type }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      ROOM_TYPE_STYLES[type] || ROOM_TYPE_STYLES.general
    )}>
      {ROOM_TYPE_ICONS[type]} {type?.replace('_', ' ')}
    </span>
  )
}

export default function Badge({ children, className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      'bg-white/10 text-text-secondary border border-white/10',
      className
    )}>
      {children}
    </span>
  )
}
