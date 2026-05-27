import { formatDuration } from '../../lib/utils'

export default function MyRankCard({ myStats, entries, currentUserId }) {
  const idx = entries.findIndex(e => e.userId?.toString() === currentUserId)
  const rank = idx >= 0 ? idx + 1 : null
  const inTopThree = rank !== null && rank <= 3

  const minutesToNext = rank && rank > 1
    ? (entries[rank - 2]?.totalMinutes ?? 0) - (myStats?.totalMinutes ?? 0) + 1
    : null
  const nextRank = rank ? rank - 1 : null

  if (!myStats?.totalMinutes && rank === null) {
    return (
      <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-4 text-center">
        <p className="text-text-muted text-sm">No sessions this week yet — start studying to appear on the leaderboard!</p>
      </div>
    )
  }

  return (
    <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">Your Rank</p>
            <p className="text-2xl font-bold font-mono text-accent-teal">
              {rank ? `#${rank}` : inTopThree ? `#${rank}` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">This Week</p>
            <p className="text-lg font-semibold font-mono text-text-primary">{formatDuration(myStats?.totalMinutes || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">Avg Focus</p>
            <p className="text-lg font-semibold font-mono text-text-primary">{myStats?.avgFocus || 0}%</p>
          </div>
        </div>
        {minutesToNext > 0 && nextRank && (
          <p className="text-xs text-text-secondary">
            Study <span className="text-accent-teal font-semibold">{formatDuration(minutesToNext)}</span> more to reach <span className="font-semibold">#{nextRank}</span>
          </p>
        )}
        {rank === 1 && (
          <p className="text-xs text-accent-amber font-semibold">You're #1 this week! 🏆</p>
        )}
      </div>
    </div>
  )
}
