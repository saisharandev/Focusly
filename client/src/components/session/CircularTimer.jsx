import { formatSeconds } from '../../lib/utils'

const FOCUS_COLORS = {
  focused:    '#14B8A6',
  idle:       '#F59E0B',
  distracted: '#EF4444',
  neutral:    '#A855F7',
}

const PHASE_LABELS = {
  IDLE:        'Ready to start',
  WORKING:     'Focus time',
  SHORT_BREAK: 'Short break',
  LONG_BREAK:  'Long break — you earned it',
  PAUSED:      'Paused',
}

const PHASE_COLORS = {
  WORKING:     '#14B8A6',
  SHORT_BREAK: '#60A5FA',
  LONG_BREAK:  '#A855F7',
  PAUSED:      '#F59E0B',
  IDLE:        '#52525B',
}

export default function CircularTimer({
  remaining,
  totalDuration,
  phase = 'WORKING',
  focusState = 'focused',
  cycleCount = 0,
}) {
  const r = 100
  const cx = 120
  const cy = 120
  const circumference = 2 * Math.PI * r

  const progress = totalDuration > 0 ? remaining / totalDuration : 1
  const strokeDashoffset = circumference * (1 - progress)

  // Ring color: driven by focus state during WORKING phase, by phase otherwise
  const ringColor = phase === 'WORKING'
    ? (FOCUS_COLORS[focusState] || FOCUS_COLORS.focused)
    : (PHASE_COLORS[phase] || PHASE_COLORS.IDLE)

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={240} height={240} viewBox="0 0 240 240">
        {/* Track ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={10}
        />
        {/* Progress ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${ringColor}60)`,
          }}
        />
        {/* Time display */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FAFAFA"
          fontSize={36}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
        >
          {formatSeconds(remaining)}
        </text>
        {/* Phase label */}
        <text
          x={cx} y={cy + 26}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#71717A"
          fontSize={12}
          fontFamily="Inter, sans-serif"
        >
          {PHASE_LABELS[phase] || ''}
        </text>
        {/* Cycle counter */}
        {cycleCount > 0 && (
          <text
            x={cx} y={cy + 46}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#52525B"
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            Cycle {cycleCount}
          </text>
        )}
      </svg>
    </div>
  )
}
