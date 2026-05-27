import { Crown } from 'lucide-react'

const STATUS_STYLES = {
  focused:    { dot: 'bg-accent-teal shadow-[0_0_6px_#14B8A6]', label: 'text-accent-teal' },
  idle:       { dot: 'bg-accent-amber',                          label: 'text-accent-amber' },
  distracted: { dot: 'bg-accent-red',                            label: 'text-accent-red' },
  untracked:  { dot: 'bg-text-muted',                            label: 'text-text-muted' },
}

export default function MemberCard({ member, isHost, currentUserId, timeInRoom }) {
  const isMe = member.userId === currentUserId
  const styles = STATUS_STYLES[member.status] || STATUS_STYLES.untracked
  const mins = timeInRoom ? Math.floor(timeInRoom / 60) : 0

  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
      isMe ? 'bg-accent-teal/5 border-accent-teal/20' : 'bg-white/3 border-white/8'
    }`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-accent-teal/20 flex items-center justify-center text-lg font-bold text-accent-teal">
          {member.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-bg-surface ${styles.dot}`} />
        {isHost && (
          <span className="absolute -top-1 -right-1">
            <Crown size={14} className="text-accent-amber" />
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-text-primary truncate max-w-[80px]">
          {member.name}{isMe && ' (you)'}
        </p>
        <p className={`text-xs mt-0.5 ${styles.label}`}>
          {member.status || 'untracked'}
        </p>
        {typeof member.focusScore === 'number' && (
          <p className="text-xs text-text-muted mt-0.5">{member.focusScore}% focus</p>
        )}
        {mins > 0 && (
          <p className="text-xs text-text-muted mt-0.5">{mins}m</p>
        )}
      </div>
    </div>
  )
}
