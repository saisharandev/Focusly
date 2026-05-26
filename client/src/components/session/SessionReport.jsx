import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatDuration } from '../../lib/utils'

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-text-primary font-semibold text-sm">{value}</span>
    </div>
  )
}

export default function SessionReport({ isOpen, onClose, session }) {
  const navigate = useNavigate()
  if (!session) return null

  const focusColor =
    session.focusScore >= 80 ? 'text-accent-teal' :
    session.focusScore >= 60 ? 'text-accent-amber' : 'text-accent-red'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Complete" size="sm">
      <div className="space-y-1 mb-6">
        <StatRow label="Subject" value={session.subject} />
        <StatRow label="Duration" value={formatDuration(session.actualDuration)} />
        <StatRow
          label="Focus Score"
          value={<span className={focusColor}>{session.focusScore}%</span>}
        />
        <StatRow
          label="Time Focused"
          value={formatDuration(Math.round((session.actualDuration * session.focusScore) / 100))}
        />
        <StatRow label="Distractions" value={session.distractionCount} />
        <StatRow
          label="Status"
          value={
            session.status === 'completed'
              ? <span className="text-accent-teal">✓ Completed</span>
              : <span className="text-accent-amber">⚠ Ended early</span>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => { onClose(); navigate('/session/new') }}
        >
          New Session
        </Button>
        <Button
          className="flex-1"
          onClick={() => { onClose(); navigate('/dashboard') }}
        >
          Dashboard
        </Button>
      </div>
    </Modal>
  )
}
