import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Video } from 'lucide-react'
import api from '../../lib/api'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const ROOM_TYPES = [
  { value: 'general',    label: '🎯 General' },
  { value: 'silent',     label: '🤫 Silent' },
  { value: 'coding',     label: '💻 Coding' },
  { value: 'exam',       label: '📚 Exam Prep' },
  { value: 'late_night', label: '🌙 Late Night' },
]

export default function RoomCreate() {
  const navigate = useNavigate()
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'general', subjectTag: '',
    isPublic: true, maxMembers: 6,
    timerMode: 'pomodoro', workDuration: 25,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleVideoMode(enabled) {
    setVideoEnabled(enabled)
    if (enabled && form.maxMembers > 4) {
      set('maxMembers', 4)
    }
  }

  async function handleCreate() {
    if (!form.name.trim()) { setError('Room name is required'); return }
    setIsLoading(true)
    setError('')
    try {
      const res = await api.post('/api/rooms', { ...form, videoEnabled })
      navigate(`/rooms/${res.data.room._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create a Room</h1>
        <p className="text-text-muted text-sm mt-0.5">Set up a group study session.</p>
      </div>

      <Card className="p-6 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
            {error}
          </div>
        )}

        {/* Room Mode selector */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Room Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleVideoMode(false)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all ${
                !videoEnabled
                  ? 'bg-accent-teal/10 border-accent-teal/40 text-accent-teal'
                  : 'bg-bg-card border-white/10 text-text-secondary hover:border-white/20'
              }`}
            >
              <Users size={22} />
              <span className="text-sm font-semibold">Study Room</span>
              <span className="text-xs opacity-70 text-center">Text chat + focus tracking</span>
            </button>
            <button
              onClick={() => toggleVideoMode(true)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all ${
                videoEnabled
                  ? 'bg-accent-purple/10 border-accent-purple/40 text-accent-purple'
                  : 'bg-bg-card border-white/10 text-text-secondary hover:border-white/20'
              }`}
            >
              <Video size={22} />
              <span className="text-sm font-semibold">Video Room</span>
              <span className="text-xs opacity-70 text-center">Live video for up to 4 people</span>
            </button>
          </div>
          {videoEnabled && (
            <p className="text-xs text-accent-purple mt-2 px-1">
              📹 Video rooms use WebRTC peer-to-peer — no video is stored or sent to our servers.
            </p>
          )}
        </div>

        <Input label="Room Name" placeholder="e.g. DSA Grind Session" value={form.name} onChange={e => set('name', e.target.value)} />
        <Input label="Subject Tag" placeholder="e.g. DBMS, Algorithms" value={form.subjectTag} onChange={e => set('subjectTag', e.target.value)} />

        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Room Type</label>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => set('type', t.value)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all ${
                  form.type === t.value
                    ? 'bg-accent-teal/10 border border-accent-teal/40 text-accent-teal'
                    : 'bg-bg-card border border-white/10 text-text-secondary hover:border-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Privacy</label>
            <div className="flex gap-2">
              {['Public', 'Private'].map(p => (
                <button
                  key={p}
                  onClick={() => set('isPublic', p === 'Public')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    (p === 'Public') === form.isPublic
                      ? 'bg-accent-teal text-bg-base'
                      : 'bg-bg-card text-text-secondary border border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Max Members {videoEnabled && <span className="text-accent-purple">(max 4 for video)</span>}
            </label>
            <select
              value={form.maxMembers}
              onChange={e => set('maxMembers', Number(e.target.value))}
              className="w-full bg-bg-card border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-teal"
            >
              {(videoEnabled ? [2, 3, 4] : [2, 3, 4, 5, 6, 8, 10]).map(n => (
                <option key={n} value={n}>{n} members</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Timer Mode</label>
          <div className="flex gap-2">
            {['pomodoro', 'continuous'].map(mode => (
              <button
                key={mode}
                onClick={() => set('timerMode', mode)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  form.timerMode === mode
                    ? 'bg-accent-teal text-bg-base'
                    : 'bg-bg-card text-text-secondary border border-white/10'
                }`}
              >
                {mode === 'pomodoro' ? '🍅 Pomodoro' : '⏱ Continuous'}
              </button>
            ))}
          </div>
        </div>

        {form.timerMode === 'pomodoro' && (
          <div className="flex gap-2 flex-wrap">
            {[25, 50].map(d => (
              <button
                key={d}
                onClick={() => set('workDuration', d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.workDuration === d
                    ? 'bg-accent-teal text-bg-base'
                    : 'bg-bg-card text-text-secondary border border-white/10'
                }`}
              >
                {d}m work
              </button>
            ))}
          </div>
        )}

        <Button onClick={handleCreate} isLoading={isLoading} className="w-full" size="lg">
          Create Room
        </Button>
      </Card>
    </div>
  )
}
