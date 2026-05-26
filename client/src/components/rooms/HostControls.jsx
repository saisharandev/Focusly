import { Play, Pause, SkipForward, Trash2 } from 'lucide-react'
import Button from '../ui/Button'

export default function HostControls({ timerPhase, onStart, onPause, onResume, onSkip, onEndRoom }) {
  const isRunning = timerPhase === 'WORKING' || timerPhase === 'SHORT_BREAK' || timerPhase === 'LONG_BREAK'
  const isPaused = timerPhase === 'PAUSED'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-text-muted mr-1">Host controls:</span>

      {timerPhase === 'IDLE' && (
        <Button size="sm" onClick={onStart}>
          <Play size={14} />
          Start Timer
        </Button>
      )}
      {isRunning && (
        <Button size="sm" variant="secondary" onClick={onPause}>
          <Pause size={14} />
          Pause
        </Button>
      )}
      {isPaused && (
        <Button size="sm" onClick={onResume}>
          <Play size={14} />
          Resume
        </Button>
      )}
      {(isRunning || isPaused) && (
        <Button size="sm" variant="ghost" onClick={onSkip}>
          <SkipForward size={14} />
          Skip
        </Button>
      )}

      <div className="ml-auto">
        <Button size="sm" variant="danger" onClick={onEndRoom}>
          <Trash2 size={14} />
          End Room
        </Button>
      </div>
    </div>
  )
}
