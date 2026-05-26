import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'
import { formatDate } from '../../lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const mins = payload[0].value
  const hours = Math.floor(mins / 60)
  const m = mins % 60
  return (
    <div className="bg-bg-surface border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-text-secondary text-xs mb-1">{label}</p>
      <p className="text-text-primary font-semibold text-sm">
        {hours > 0 ? `${hours}h ${m}m` : `${m}m`}
      </p>
    </div>
  )
}

export default function WeeklyChart({ data, isLoading }) {
  if (isLoading) return <Skeleton className="h-64" />
  if (!data?.length) return null

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
  const avg = Math.round(data.reduce((s, d) => s + d.minutes, 0) / data.length)

  const chartData = data.map(d => ({
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    minutes: d.minutes,
  }))

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">Weekly Study Hours</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#71717A', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => {
              const h = Math.floor(v / 60)
              return h > 0 ? `${h}h` : `${v}m`
            }}
            tick={{ fill: '#71717A', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine y={avg} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Bar
            dataKey="minutes"
            radius={[6, 6, 0, 0]}
            cell={chartData.map((d, i) => (
              <rect key={i} fill={d.day === today ? '#14B8A6' : '#27272A'} />
            ))}
            fill="#27272A"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
