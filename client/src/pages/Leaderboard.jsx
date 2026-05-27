import { useState, useEffect, useCallback } from 'react'
import { Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBattle } from '../context/BattleContext'
import api from '../lib/api'
import Podium from '../components/leaderboard/Podium'
import RankTable from '../components/leaderboard/RankTable'
import MyRankCard from '../components/leaderboard/MyRankCard'

const SCOPES = ['friends', 'university', 'global']

function getWeekLabel() {
  const now = new Date()
  const day = now.getUTCDay()
  const start = new Date(now)
  start.setUTCDate(now.getUTCDate() - (day === 0 ? 6 : day - 1))
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week of ${fmt(start)} – ${fmt(end)}`
}

function getResetCountdown() {
  const now = new Date()
  const day = now.getUTCDay()
  const next = new Date(now)
  next.setUTCDate(now.getUTCDate() + (day === 0 ? 1 : 8 - day))
  next.setUTCHours(0, 0, 0, 0)
  const diff = next - now
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return days > 0 ? `Resets in ${days}d ${hours}h` : `Resets in ${hours}h`
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 animate-pulse">
      <div className="w-6 h-4 bg-white/10 rounded" />
      <div className="w-8 h-8 rounded-full bg-white/10" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded w-32" />
        <div className="h-2.5 bg-white/8 rounded w-20" />
      </div>
      <div className="w-12 h-3 bg-white/10 rounded" />
      <div className="w-8 h-3 bg-white/10 rounded" />
    </div>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const { challengeUser } = useBattle()
  const [scope, setScope] = useState('friends')
  const [entries, setEntries] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cachedAt, setCachedAt] = useState(null)

  const fetchLeaderboard = useCallback(async (s) => {
    setLoading(true)
    setError(null)
    try {
      const [boardRes, meRes] = await Promise.all([
        api.get(`/api/leaderboard/${s}`),
        api.get('/api/leaderboard/me'),
      ])
      setEntries(Array.isArray(boardRes.data.entries) ? boardRes.data.entries : [])
      setCachedAt(boardRes.data.cachedAt || null)
      setMyStats(meRes.data)
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaderboard(scope) }, [scope, fetchLeaderboard])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const scopeEmpty = !loading && entries.length === 0
  const noUniversity = scope === 'university' && !user?.university

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={20} className="text-accent-amber" />
            <h1 className="text-xl font-bold text-text-primary">Leaderboard</h1>
          </div>
          <p className="text-sm text-text-muted">{getWeekLabel()}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-text-muted bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
            {getResetCountdown()}
          </span>
          {cachedAt && (
            <span className="text-[11px] text-text-muted">
              Updated {Math.max(0, Math.round((Date.now() - cachedAt) / 60000))} min ago
            </span>
          )}
        </div>
      </div>

      {/* Scope tabs */}
      <div className="flex gap-1 p-1 bg-bg-card rounded-xl w-fit">
        {SCOPES.map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              scope === s
                ? 'bg-accent-teal text-bg-base'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      {noUniversity && (
        <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-8 text-center space-y-2">
          <p className="text-4xl">🏫</p>
          <p className="text-text-primary font-medium">No university set</p>
          <p className="text-text-muted text-sm">Add your university in your profile to see this leaderboard.</p>
        </div>
      )}

      {!noUniversity && loading && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/8 rounded-2xl h-44 animate-pulse" />
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      )}

      {!noUniversity && !loading && scopeEmpty && (
        <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-8 text-center space-y-2">
          <p className="text-4xl">📚</p>
          <p className="text-text-primary font-medium">
            {scope === 'friends' ? 'No study buddies yet' : 'No data this week'}
          </p>
          <p className="text-text-muted text-sm">
            {scope === 'friends'
              ? 'Join a study room to add people to your friends leaderboard.'
              : 'No completed sessions this week in this scope.'}
          </p>
        </div>
      )}

      {!noUniversity && !loading && entries.length > 0 && (
        <>
          <Podium entries={top3} />
          <RankTable
            entries={rest}
            currentUserId={user?._id || user?.id}
            scope={scope}
            onChallenge={challengeUser}
          />
        </>
      )}

      {!loading && (
        <MyRankCard
          myStats={myStats}
          entries={entries}
          currentUserId={user?._id || user?.id}
        />
      )}
    </div>
  )
}
