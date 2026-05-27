import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { Edit2, Flame, Trophy, Target, Clock, BookOpen } from 'lucide-react'
import { formatDuration } from '../lib/utils'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
]

function memberSince(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function cellColor(minutes) {
  if (!minutes) return 'bg-white/5'
  if (minutes < 30) return 'bg-teal-900/70'
  if (minutes < 90) return 'bg-accent-teal/40'
  return 'bg-accent-teal'
}

function cellTitle(date, minutes) {
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (!minutes) return `${label} — no study`
  return `${label} — ${formatDuration(minutes)}`
}

function Heatmap({ days }) {
  if (!days || days.length === 0) return null

  const heatmapMap = {}
  days.forEach(({ date, minutes }) => { heatmapMap[date] = minutes })

  const allDays = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    allDays.push(d.toISOString().split('T')[0])
  }

  const firstDate = new Date(allDays[0] + 'T12:00:00')
  const startDayOfWeek = firstDate.getDay()
  const padded = [...Array(startDayOfWeek).fill(null), ...allDays]
  while (padded.length % 7 !== 0) padded.push(null)

  const weeks = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  const monthLabels = []
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null)
    if (!firstReal) { monthLabels.push(''); return }
    const d = new Date(firstReal + 'T12:00:00')
    if (wi === 0 || d.getDate() <= 7) {
      monthLabels.push(d.toLocaleDateString('en-US', { month: 'short' }))
    } else {
      monthLabels.push('')
    }
  })

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        <div className="flex flex-col gap-1 mr-1 mt-5">
          {DAYS.map(d => (
            <div key={d} className="h-3 w-4 text-[9px] text-text-muted flex items-center">{d}</div>
          ))}
        </div>
        <div>
          <div className="flex gap-1 mb-1">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-3 text-[9px] text-text-muted text-center leading-none">{label}</div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((date, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${date ? cellColor(heatmapMap[date] || 0) : 'opacity-0'}`}
                    title={date ? cellTitle(date, heatmapMap[date] || 0) : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-text-muted">Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-teal-900/70" />
        <div className="w-3 h-3 rounded-sm bg-accent-teal/40" />
        <div className="w-3 h-3 rounded-sm bg-accent-teal" />
        <span className="text-[10px] text-text-muted">More</span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-accent-teal' }) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <span className="text-xl font-bold text-text-primary">{value}</span>
    </Card>
  )
}

function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '')
      setUniversity(user?.university || '')
      setTimezone(user?.timezone || 'UTC')
      setSaved(false)
    }
  }, [isOpen, user])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await api.patch('/api/users/me', { name, university, timezone })
      onSave(res.data.user)
      setSaved(true)
      setTimeout(onClose, 800)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="University"
          value={university}
          onChange={e => setUniversity(e.target.value)}
          placeholder="Your university (optional)"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-colors"
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            disabled={!name.trim()}
            className="flex-1"
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const CATEGORIES = [
  { key: 'focus',  label: 'Focus',   color: 'text-accent-teal',   border: 'border-accent-teal/30',   bg: 'bg-accent-teal/10' },
  { key: 'time',   label: 'Time',    color: 'text-accent-purple',  border: 'border-accent-purple/30', bg: 'bg-accent-purple/10' },
  { key: 'streak', label: 'Streaks', color: 'text-accent-amber',   border: 'border-accent-amber/30',  bg: 'bg-accent-amber/10' },
  { key: 'social', label: 'Social',  color: 'text-blue-400',       border: 'border-blue-400/30',      bg: 'bg-blue-400/10' },
]

function AchievementsGallery({ allAchievements, unlockedAchievements }) {
  const unlockedMap = Object.fromEntries(unlockedAchievements.map(a => [a.code, a.unlockedAt]))
  const total = allAchievements.length || 18
  const unlockedCount = unlockedAchievements.length

  const grouped = {}
  CATEGORIES.forEach(c => { grouped[c.key] = [] })
  allAchievements.forEach(ach => {
    if (grouped[ach.category]) {
      grouped[ach.category].push({ ...ach, isUnlocked: !!unlockedMap[ach.code], unlockedAt: unlockedMap[ach.code] || null })
    }
  })

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Achievements</h2>
        <span className="text-xs text-text-muted bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
          {unlockedCount} / {total} unlocked
        </span>
      </div>

      {CATEGORIES.map(cat => {
        const items = grouped[cat.key] || []
        if (!items.length) return null
        return (
          <div key={cat.key}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${cat.color}`}>{cat.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map(ach => (
                <div
                  key={ach.code}
                  title={ach.isUnlocked ? `Unlocked ${new Date(ach.unlockedAt).toLocaleDateString()}` : 'Locked'}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                    ach.isUnlocked
                      ? `${cat.border} ${cat.bg}`
                      : 'border-white/8 bg-white/3 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl leading-none">{ach.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${ach.isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                      {ach.name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">{ach.description}</p>
                  </div>
                  {ach.isUnlocked && ach.unlockedAt && (
                    <p className={`text-[9px] font-medium ${cat.color}`}>
                      {new Date(ach.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {allAchievements.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">Complete sessions to unlock achievements.</p>
      )}
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-5">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  )
}

export default function Profile() {
  const { userId } = useParams()
  const { user: authUser } = useAuth()
  const isOwn = !userId

  const [data, setData] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [achievements, setAchievements] = useState([])
  const [allAchievements, setAllAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const profileReq = isOwn
      ? api.get('/api/users/me')
      : api.get(`/api/users/${userId}`)

    const requests = [profileReq]
    if (isOwn) {
      requests.push(api.get('/api/analytics/heatmap'))
      requests.push(api.get('/api/achievements/me').catch(() => ({ data: [] })))
      requests.push(api.get('/api/achievements').catch(() => ({ data: [] })))
    }

    Promise.all(requests)
      .then(([profileRes, heatmapRes, achRes, allAchRes]) => {
        setData(profileRes.data)
        if (heatmapRes) setHeatmapData(heatmapRes.data.days || [])
        if (achRes) setAchievements(Array.isArray(achRes.data) ? achRes.data : [])
        if (allAchRes) setAllAchievements(Array.isArray(allAchRes.data) ? allAchRes.data : [])
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [userId, isOwn])

  function handleProfileSave(updatedUser) {
    setData(prev => ({ ...prev, user: { ...prev.user, ...updatedUser } }))
  }

  if (loading) return <ProfileSkeleton />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-accent-red">
          {error}
        </div>
      </div>
    )
  }

  const { user, stats, topSubjects, recentSessions } = data

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const totalHours = stats?.totalMinutes ? (stats.totalMinutes / 60).toFixed(1) : '0'

  const STATUS_COLORS = {
    completed: 'text-accent-teal',
    abandoned: 'text-accent-red',
    in_progress: 'text-accent-amber',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal text-3xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary leading-tight">{user.name}</h1>
            {user.university && (
              <p className="text-text-muted text-sm mt-0.5">{user.university}</p>
            )}
            <p className="text-text-muted text-xs mt-1">Member since {memberSince(user.createdAt)}</p>
          </div>
          {isOwn && (
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="flex-shrink-0">
              <Edit2 size={15} />
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Clock} label="Total Hours" value={`${totalHours}h`} color="text-accent-teal" />
        <StatCard icon={Flame} label="Current Streak" value={`${user.currentStreak ?? 0}d`} color="text-accent-amber" />
        <StatCard icon={Trophy} label="Longest Streak" value={`${user.longestStreak ?? 0}d`} color="text-accent-purple" />
        <StatCard icon={Target} label="Avg Focus" value={`${stats?.avgFocusScore ?? 0}%`} color="text-accent-teal" />
        <StatCard icon={BookOpen} label="Sessions" value={stats?.sessionCount ?? 0} color="text-text-secondary" />
      </div>

      {isOwn && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Study Activity (Last 90 Days)</h2>
          {heatmapData.length > 0 ? (
            <Heatmap days={heatmapData} />
          ) : (
            <p className="text-sm text-text-muted">No study data yet. Complete a session to see your activity.</p>
          )}
        </Card>
      )}

      {topSubjects && topSubjects.length > 0 && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Top Subjects</h2>
          <div className="space-y-2.5">
            {topSubjects.map(({ name, minutes, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-text-primary flex-1 truncate">{name}</span>
                <span className="text-sm text-text-muted">{formatDuration(minutes)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOwn && recentSessions && recentSessions.length > 0 && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-white/8">
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Subject</th>
                  <th className="text-right pb-2 font-medium">Duration</th>
                  <th className="text-right pb-2 font-medium">Focus</th>
                  <th className="text-right pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSessions.map(session => (
                  <tr key={session._id}>
                    <td className="py-2.5 text-text-muted">
                      {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 text-text-primary">{session.subject || 'General'}</td>
                    <td className="py-2.5 text-right text-text-muted">{formatDuration(session.actualDuration || 0)}</td>
                    <td className="py-2.5 text-right text-text-muted">
                      {session.status === 'completed' ? `${session.focusScore ?? 0}%` : '—'}
                    </td>
                    <td className={`py-2.5 text-right capitalize ${STATUS_COLORS[session.status] || 'text-text-muted'}`}>
                      {session.status?.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isOwn && <AchievementsGallery allAchievements={allAchievements} unlockedAchievements={achievements} />}

      {isOwn && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSave={handleProfileSave}
        />
      )}
    </div>
  )
}
