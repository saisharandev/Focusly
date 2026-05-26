import { Play, Pause, SkipForward, RotateCcw, Lock } from 'lucide-react'
import CircularTimer from '../session/CircularTimer'
import Button from '../ui/Button'
import usePomodoroTimer from '../../hooks/usePomodoroTimer'

const PHASE_DURATIONS = {
  WORKING:     state => state.workDuration * 60,
  SHORT_BREAK: state => state.shortBreak * 60,
  LONG_BREAK:  state => state.longBreak * 60,
  IDLE:        state => state.workDuration * 60,
  PAUSED:      state => (state.prePausePhase ? state[state.prePausePhase === 'WORKING' ? 'workDuration' : 'shortBreak'] * 60 : state.workDuration * 60),
}

export default function PomodoroTimer({
  workDuration = 25,
  shortBreak = 5,
  longBreak = 15,
  focusState = 'focused',
  synced = false,
  isHost = true,
  onStart,
  onPause,
  onResume,
  onSkip,
  externalState,
}) {
  const local = usePomodoroTimer({ workDuration, shortBreak, longBreak, synced })
  const timer = synced && externalState ? { ...local, ...externalState } : local

  const totalDuration = PHASE_DURATIONS[timer.phase]?.(timer) || workDuration * 60
  const canControl = !synced || isHost

  function handleStart() {
    if (!canControl) return
    local.start()
    onStart?.({ phase: 'WORKING', workDuration, shortBreak, longBreak })
  }

  function handlePause() {
    if (!canControl) return
    local.pause()
    onPause?.()
  }

  function handleResume() {
    if (!canControl) return
    local.resume()
    onResume?.()
  }

  function handleSkip() {
    if (!canControl) return
    local.skip()
    onSkip?.()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <CircularTimer
        remaining={timer.remaining}
        totalDuration={totalDuration}
        phase={timer.phase}
        focusState={focusState}
        cycleCount={timer.cycleCount}
      />

      <div className={`flex items-center gap-3 ${!canControl ? 'opacity-50 pointer-events-none' : ''}`}>
        {timer.phase === 'IDLE' ? (
          <Button onClick={handleStart} size="lg">
            <Play size={18} />
            Start
          </Button>
        ) : timer.phase === 'PAUSED' ? (
          <Button onClick={handleResume} size="lg">
            <Play size={18} />
            Resume
          </Button>
        ) : (
          <Button onClick={handlePause} variant="secondary" size="lg">
            <Pause size={18} />
            Pause
          </Button>
        )}

        <Button onClick={handleSkip} variant="ghost" size="md" title="Skip phase">
          <SkipForward size={16} />
        </Button>

        <Button onClick={() => local.reset()} variant="ghost" size="md" title="Reset">
          <RotateCcw size={16} />
        </Button>
      </div>

      {synced && !isHost && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Lock size={12} />
          Host controls timer
        </div>
      )}
    </div>
  )
}
