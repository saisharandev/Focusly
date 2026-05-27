import { formatDuration } from '../../lib/utils'

export default function RankTable({ entries, currentUserId }) {
  if (!entries.length) return null

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-x-4 px-4 py-2.5 border-b border-white/8 text-xs text-text-muted uppercase tracking-wider">
        <span>#</span>
        <span>Name</span>
        <span className="text-right">Hours</span>
        <span className="text-right">Focus</span>
      </div>
      {entries.map((entry, i) => {
        const isMe = entry.userId?.toString() === currentUserId
        return (
          <div
            key={entry.userId?.toString() || i}
            className={`grid grid-cols-[3rem_1fr_auto_auto] gap-x-4 px-4 py-3 items-center border-b border-white/5 last:border-0 transition-colors ${
              isMe ? 'bg-accent-teal/10 border-l-2 border-l-accent-teal' : 'hover:bg-white/3'
            }`}
          >
            <span className="text-sm font-semibold text-text-muted">#{i + 4}</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                {entry.avatarUrl
                  ? <img src={entry.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                  : entry.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isMe ? 'text-accent-teal' : 'text-text-primary'}`}>
                  {entry.name} {isMe && <span className="text-xs">(you)</span>}
                </p>
                {entry.university && (
                  <p className="text-xs text-text-muted truncate">{entry.university}</p>
                )}
              </div>
            </div>
            <span className="text-sm text-text-secondary text-right">{formatDuration(entry.totalMinutes)}</span>
            <span className="text-sm text-text-muted text-right">{entry.avgFocus}%</span>
          </div>
        )
      })}
    </div>
  )
}
