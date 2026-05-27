import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Clock, Target, CheckCircle, Star, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import api from '../lib/api'
import { formatDuration } from '../lib/utils'
import StatsCard from '../components/dashboard/StatsCard'
import Skeleton from '../components/ui/Skeleton'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

const RANGE_OPTIONS = [
  { value: 'this_week',   label: 'This Week' },
  { value: 'last_week',   label: 'Last Week' },
  { value: 'this_month',  label: 'This Month' },
  { value: 'last_30',     label: 'Last 30 Days' },
  { value: 'all_time',    label: 'All Time' },
]

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function focusToColor(avgFocus) {
  if (avgFocus >= 75) return '#14B8A6'
  if (avgFocus >= 50) return '#F59E0B'
  return '#EF4444'
}

function dateAbbr(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function TimeRangeSelector({ range, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {RANGE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            range === opt.value
              ? 'bg-accent-teal text-bg-base'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-white/8'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function DailyChart({ data, isLoading }) {
  if (isLoading) return <Skeleton className="h-72" />

  const formatted = data.map(d => ({
    ...d,
    hours: parseFloat((d.minutes / 60).toFixed(1)),
    label: dateAbbr(d.date),
    fill: focusToColor(d.avgFocus),
  }))

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Daily Study Time</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} barSize={24}>
          <XAxis dataKey="label" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#71717A', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}h`}
            width={32}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs">
                  <p className="text-text-primary font-semibold">{d.hours} hrs</p>
                  {d.avgFocus > 0 && <p className="text-text-muted">{d.avgFocus}% focus</p>}
                </div>
              )
            }}
          />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.minutes > 0 ? entry.fill : '#27272A'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

function FocusTrendChart({ data, isLoading }) {
  if (isLoading) return <Skeleton className="h-72" />

  const formatted = data.map(d => ({
    ...d,
    label: dateAbbr(d.date),
  }))

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Focus Trend</h2>
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="w-4 h-0.5 bg-[#14B8A6] inline-block" />Daily
        </span>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="w-4 h-0.5 bg-[#A855F7] inline-block border-dashed border-t border-[#A855F7]" />7-day avg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formatted}>
          <XAxis dataKey="label" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} width={32} tickFormatter={v => `${v}%`} />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs space-y-1">
                  <p className="text-text-secondary font-medium">{label}</p>
                  {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value !== null ? `${p.value}%` : '—'}</p>
                  ))}
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="focusScore"
            name="Focus"
            stroke="#14B8A6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#14B8A6' }}
            connectNulls={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="rollingAvg"
            name="7-day avg"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

function SubjectDonut({ data, totalMinutes, isLoading }) {
  if (isLoading) return <Skeleton className="h-72" />

  if (!data.length) {
    return (
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subjects</h2>
        <p className="text-text-muted text-sm text-center py-12">No session data for this period</p>
      </Card>
    )
  }

  const totalHrs = (totalMinutes / 60).toFixed(1)

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Subjects</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="subject"
              cx={100}
              cy={100}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xl font-bold text-text-primary">{totalHrs}h</p>
            <p className="text-xs text-text-muted">total</p>
          </div>
        </div>
        <div className="mt-4 w-full space-y-2">
          {data.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-text-secondary truncate max-w-[140px]">{s.subject}</span>
              </div>
              <span className="text-text-muted">{formatDuration(s.minutes)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function HourlyHeatmap({ data, isLoading }) {
  if (isLoading) return <Skeleton className="h-72" />

  const byKey = {}
  for (const cell of data) {
    byKey[`${cell.hour}-${cell.day}`] = cell.avgFocus
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 6)
  const hourLabel = h => {
    if (h === 12) return '12p'
    if (h < 12) return `${h}a`
    return `${h - 12}p`
  }

  function cellColor(avgFocus) {
    if (avgFocus === null || avgFocus === undefined) return 'bg-white/5'
    if (avgFocus >= 70) return 'bg-teal-500/60'
    if (avgFocus >= 40) return 'bg-teal-500/30'
    return 'bg-amber-500/20'
  }

  const showColLabel = h => h % 3 === 0

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Peak Study Hours</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-1 ml-10">
            {hours.map(h => (
              <div key={h} className="w-8 text-center text-[10px] text-text-muted">
                {showColLabel(h) ? hourLabel(h) : ''}
              </div>
            ))}
          </div>
          {DAY_LABELS.map((day, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1 mb-1">
              <span className="w-9 text-[11px] text-text-muted text-right pr-1 flex-shrink-0">{day}</span>
              {hours.map(hour => {
                const focus = byKey[`${hour}-${dayIdx}`]
                const hourStr = hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`
                const title = focus !== null && focus !== undefined
                  ? `${day} ${hourStr} — ${focus}% focus`
                  : `${day} ${hourStr} — no data`
                return (
                  <div
                    key={hour}
                    title={title}
                    className={`w-8 h-8 rounded-sm ${cellColor(focus)} transition-opacity hover:opacity-80 cursor-default`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
        <span>Less</span>
        <span className="w-4 h-4 rounded-sm bg-white/5 inline-block" />
        <span className="w-4 h-4 rounded-sm bg-amber-500/20 inline-block" />
        <span className="w-4 h-4 rounded-sm bg-teal-500/30 inline-block" />
        <span className="w-4 h-4 rounded-sm bg-teal-500/60 inline-block" />
        <span>More</span>
      </div>
    </Card>
  )
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SessionHistoryTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sessions, setSessions] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const params = new URLSearchParams({ page, limit: 10 })
    if (debouncedSearch) params.set('subject', debouncedSearch)

    api.get(`/api/sessions/history?${params}`)
      .then(res => {
        if (cancelled) return
        setSessions(res.data.sessions || [])
        setTotal(res.data.total || 0)
        setPages(res.data.pages || 1)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [page, debouncedSearch])

  function statusBadge(status) {
    if (status === 'completed') return 'bg-accent-teal/15 text-accent-teal'
    if (status === 'abandoned') return 'bg-accent-red/15 text-accent-red'
    return 'bg-white/10 text-text-muted'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Session History</h2>
        <input
          type="text"
          placeholder="Filter by subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-bg-card border border-white/10 text-text-primary text-sm rounded-xl px-3 py-1.5 placeholder:text-text-muted focus:outline-none focus:border-accent-teal/50 w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No sessions yet"
          description="Your completed study sessions will appear here"
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-white/8">
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Subject</th>
                  <th className="text-left pb-3 font-medium">Duration</th>
                  <th className="text-left pb-3 font-medium">Focus</th>
                  <th className="text-left pb-3 font-medium">Distractions</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessions.map(s => (
                  <tr key={s._id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 text-text-secondary">
                      {new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-text-primary font-medium">{s.subject || 'General'}</td>
                    <td className="py-3 text-text-secondary">{formatDuration(s.actualDuration || 0)}</td>
                    <td className="py-3">
                      {s.focusScore > 0
                        ? <span style={{ color: focusToColor(s.focusScore) }}>{s.focusScore}%</span>
                        : <span className="text-text-muted">—</span>
                      }
                    </td>
                    <td className="py-3 text-text-secondary">{s.distractionCount ?? 0}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
              <p className="text-xs text-text-muted">Page {page} of {pages} · {total} sessions</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export default function Analytics() {
  const [range, setRange] = useState('this_week')
  const [isLoading, setIsLoading] = useState(true)

  const [summary, setSummary] = useState(null)
  const [daily, setDaily] = useState([])
  const [subjects, setSubjects] = useState([])
  const [trend, setTrend] = useState([])
  const [hourly, setHourly] = useState([])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    Promise.all([
      api.get(`/api/analytics/summary?range=${range}`),
      api.get(`/api/analytics/daily?range=${range}`),
      api.get(`/api/analytics/subjects?range=${range}`),
      api.get(`/api/analytics/focus-trend?range=${range}`),
      api.get(`/api/analytics/hourly?range=${range}`),
    ])
      .then(([sumRes, dailyRes, subRes, trendRes, hourlyRes]) => {
        if (cancelled) return
        setSummary(sumRes.data)
        setDaily(dailyRes.data.days || [])
        setSubjects(subRes.data.subjects || [])
        setTrend(trendRes.data.trend || [])
        setHourly(hourlyRes.data.grid || [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [range])

  const hasEnoughData = summary && summary.sessionCount >= 3

  const bestDayLabel = (() => {
    if (!summary?.bestDay?.date) return '—'
    const d = new Date(summary.bestDay.date + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  })()

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
      </div>

      <TimeRangeSelector range={range} onChange={setRange} />

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </>
      ) : !hasEnoughData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart2 size={48} className="text-text-muted mb-4" />
          <p className="text-text-secondary text-lg font-medium mb-2">Not enough data yet</p>
          <p className="text-text-muted text-sm max-w-sm">
            Come back after a few study sessions to see your patterns 📊
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={Clock}
              label="Total Hours"
              value={summary.totalMinutes}
              displayValue={formatDuration(summary.totalMinutes)}
              color="text-accent-teal"
            />
            <StatsCard
              icon={Target}
              label="Avg Focus Score"
              value={summary.avgFocusScore}
              displayValue={`${summary.avgFocusScore}%`}
              color="text-accent-purple"
            />
            <StatsCard
              icon={CheckCircle}
              label="Sessions Completed"
              value={summary.sessionCount}
              color="text-accent-teal"
            />
            <StatsCard
              icon={Star}
              label="Best Day"
              value={0}
              displayValue={bestDayLabel}
              color="text-accent-amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyChart data={daily} isLoading={false} />
            <FocusTrendChart data={trend} isLoading={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubjectDonut data={subjects} totalMinutes={summary.totalMinutes} isLoading={false} />
            <HourlyHeatmap data={hourly} isLoading={false} />
          </div>
        </>
      )}

      <SessionHistoryTable />
    </div>
  )
}
