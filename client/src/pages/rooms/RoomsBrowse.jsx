import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import api from '../../lib/api'
import Button from '../../components/ui/Button'
import RoomCard from '../../components/rooms/RoomCard'
import EmptyState from '../../components/ui/EmptyState'

const ROOM_TYPES = [
  { value: '', label: 'All' },
  { value: 'silent', label: '🤫 Silent' },
  { value: 'coding', label: '💻 Coding' },
  { value: 'exam', label: '📚 Exam Prep' },
  { value: 'general', label: '🎯 General' },
  { value: 'late_night', label: '🌙 Late Night' },
]

export default function RoomsBrowse() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [typeFilter])

  async function fetchRooms() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      const res = await api.get(`/api/rooms?${params}`)
      setRooms(res.data.rooms)
    } catch {
      setError('Failed to load rooms.')
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = rooms.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectTag?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Study Rooms</h1>
          <p className="text-text-muted text-sm mt-0.5">Join a room and study together.</p>
        </div>
        <Button onClick={() => navigate('/rooms/create')}>
          <Plus size={16} />
          Create Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full bg-bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal"
            placeholder="Search rooms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOM_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === t.value
                  ? 'bg-accent-teal text-bg-base'
                  : 'bg-bg-card text-text-secondary border border-white/10 hover:border-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-accent-red text-sm mb-4">{error}</p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <RoomCard.Skeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏫"
          title="No active rooms"
          description="Be the first to create a study room!"
          actionLabel="Create Room"
          onAction={() => navigate('/rooms/create')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(room => <RoomCard key={room._id} room={room} />)}
        </div>
      )}
    </div>
  )
}
