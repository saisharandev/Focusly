import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, Users, Clock, Flame, Target, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { getGreeting, formatDuration } from '../lib/utils'
import Button from '../components/ui/Button'
import StatsCard from '../components/dashboard/StatsCard'
import WeeklyChart from '../components/dashboard/WeeklyChart'
import ActiveRoomCard from '../components/dashboard/ActiveRoomCard'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [activeRooms, setActiveRooms] = useState([])
  const [neglected, setNeglected] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [streakAtRisk, setStreakAtRisk] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [statsRes, weeklyRes, roomsRes, neglectedRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/analytics/weekly'),
          api.get('/api/dashboard/active-rooms'),
          api.get('/api/subjects/neglected').catch(() => ({ data: [] })),
        ])
        setStats(statsRes.data)
        setWeeklyData(weeklyRes.data.days)
        setActiveRooms(roomsRes.data.rooms)
        setNeglected(neglectedRes.data)
        if (statsRes.data.currentStreak > 0 && !statsRes.data.studiedToday) {
          setStreakAtRisk(true)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  const greeting = getGreeting()
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {firstName}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/session/new')} size="md">
            <Timer size={16} />
            Start Session
          </Button>
          <Button onClick={() => navigate('/rooms')} variant="secondary" size="md">
            <Users size={16} />
            Browse Rooms
          </Button>
        </div>
      </div>

      {/* Neglected subject warning */}
      {neglected.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl px-4 py-3">
          <p className="text-sm text-accent-amber">
            👀 You haven't touched <strong>{neglected[0].name}</strong> in{' '}
            {Math.floor((Date.now() - new Date(neglected[0].lastUsedAt)) / 86400000)} days
          </p>
          <button onClick={() => setNeglected([])} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
        </div>
      )}

      {/* Streak at-risk warning */}
      {streakAtRisk && (
        <div className="flex items-center justify-between gap-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl px-4 py-3">
          <p className="text-sm text-accent-amber">
            🔥 Don't break your <strong>{stats.currentStreak}-day streak!</strong> You haven't studied today yet.
          </p>
          <button
            onClick={() => navigate('/session/new')}
            className="text-xs font-medium text-accent-amber border border-accent-amber/30 rounded-lg px-3 py-1.5 hover:bg-accent-amber/10 transition-colors flex-shrink-0"
          >
            Start session →
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Clock}
          label="Today's Study"
          value={stats?.todayMinutes || 0}
          displayValue={stats ? formatDuration(stats.todayMinutes) : null}
          color="text-accent-teal"
          isLoading={isLoading}
        />
        <StatsCard
          icon={Flame}
          label="Current Streak"
          value={stats?.currentStreak || 0}
          displayValue={stats ? `${stats.currentStreak} days` : null}
          color="text-accent-amber"
          isLoading={isLoading}
        />
        <StatsCard
          icon={Target}
          label="Focus Score"
          value={stats?.avgFocusScore || 0}
          displayValue={stats ? `${stats.avgFocusScore}%` : null}
          color="text-accent-purple"
          isLoading={isLoading}
        />
        <StatsCard
          icon={Zap}
          label="Sessions Today"
          value={stats?.sessionCount || 0}
          color="text-blue-400"
          isLoading={isLoading}
        />
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active rooms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Active Rooms
            </h2>
            <button
              onClick={() => navigate('/rooms')}
              className="text-xs text-accent-teal hover:underline"
            >
              Browse all →
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : activeRooms.length === 0 ? (
            <EmptyState
              icon="🏫"
              title="No active rooms"
              description="Be the first to create one!"
              actionLabel="Create Room"
              onAction={() => navigate('/rooms/create')}
            />
          ) : (
            <div className="space-y-3">
              {activeRooms.map(room => (
                <ActiveRoomCard key={room._id} room={room} />
              ))}
            </div>
          )}
        </div>

        {/* Weekly chart */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            This Week
          </h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <WeeklyChart data={weeklyData} isLoading={false} />
          )}
        </div>
      </div>
    </div>
  )
}
