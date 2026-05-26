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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [statsRes, weeklyRes, roomsRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/analytics/weekly'),
          api.get('/api/dashboard/active-rooms'),
        ])
        setStats(statsRes.data)
        setWeeklyData(weeklyRes.data.days)
        setActiveRooms(roomsRes.data.rooms)
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
