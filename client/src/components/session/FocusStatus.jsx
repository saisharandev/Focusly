const STATUS_CONFIG = {
  focused:    { color: 'bg-accent-teal',   text: 'Focused',    label: 'text-accent-teal' },
  idle:       { color: 'bg-accent-amber',  text: 'Away?',      label: 'text-accent-amber' },
  distracted: { color: 'bg-accent-red',    text: 'Distracted', label: 'text-accent-red' },
  untracked:  { color: 'bg-text-muted',    text: 'No tracking',label: 'text-text-muted' },
}

export default function FocusStatus({ status, focusScore, elapsedSeconds, distractionCount }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.untracked
  const mins = Math.floor(elapsedSeconds / 60)

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${config.color} ${status === 'focused' ? 'shadow-[0_0_8px_#14B8A6]' : ''}`} />
        <span className={`font-medium ${config.label}`}>{config.text}</span>
      </div>

      {focusScore !== undefined && (
        <span className="text-text-muted">
          Score: <span className="text-text-primary font-semibold">{focusScore}%</span>
        </span>
      )}

      <span className="text-text-muted">
        Elapsed: <span className="text-text-primary font-semibold">{mins}m</span>
      </span>

      {distractionCount > 0 && (
        <span className="text-text-muted">
          Distractions: <span className="text-accent-red font-semibold">{distractionCount}</span>
        </span>
      )}
    </div>
  )
}
