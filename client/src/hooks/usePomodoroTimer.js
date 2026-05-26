import { useReducer, useEffect, useRef } from 'react'

// Module-level AudioContext singleton (created lazily on first user interaction)
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  audioCtx.resume().catch(() => {})
  return audioCtx
}

function playTone(frequency = 660, duration = 0.6) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

const PHASE_SOUNDS = { WORKING: 440, SHORT_BREAK: 660, LONG_BREAK: 880 }

function getNextPhase(state) {
  if (state.phase === 'WORKING') {
    const nextCycle = state.cycleCount + 1
    const isLong = nextCycle % 4 === 0
    return {
      phase: isLong ? 'LONG_BREAK' : 'SHORT_BREAK',
      remaining: (isLong ? state.longBreak : state.shortBreak) * 60,
      cycleCount: nextCycle,
    }
  }
  return { phase: 'WORKING', remaining: state.workDuration * 60, cycleCount: state.cycleCount }
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'WORKING', remaining: state.workDuration * 60 }
    case 'PAUSE':
      return { ...state, phase: 'PAUSED', prePausePhase: state.phase }
    case 'RESUME':
      return { ...state, phase: state.prePausePhase || 'WORKING' }
    case 'SKIP': {
      const next = getNextPhase(state)
      return { ...state, ...next }
    }
    case 'RESET':
      return { ...state, phase: 'IDLE', remaining: state.workDuration * 60, cycleCount: 0 }
    case 'TICK':
      return { ...state, remaining: state.remaining - 1 }
    case 'PHASE_COMPLETE': {
      const next = getNextPhase(state)
      return { ...state, ...next }
    }
    case 'SYNC':
      return { ...state, ...action.payload }
    case 'SET_CONFIG':
      return { ...state, ...action.config, remaining: action.config.workDuration * 60 }
    default:
      return state
  }
}

export default function usePomodoroTimer({
  workDuration = 25,
  shortBreak = 5,
  longBreak = 15,
  onPhaseChange,
  onComplete,
  synced = false,
} = {}) {
  const [state, dispatch] = useReducer(reducer, {
    phase: 'IDLE',
    remaining: workDuration * 60,
    cycleCount: 0,
    workDuration,
    shortBreak,
    longBreak,
    prePausePhase: null,
  })

  const isRunning = state.phase !== 'IDLE' && state.phase !== 'PAUSED'

  useEffect(() => {
    if (!isRunning || synced) return

    const interval = setInterval(() => {
      if (state.remaining <= 1) {
        clearInterval(interval)
        playTone(PHASE_SOUNDS[state.phase] || 660)
        dispatch({ type: 'PHASE_COMPLETE' })
        onPhaseChange?.(getNextPhase(state).phase)
        if (state.phase === 'WORKING') onComplete?.()
      } else {
        dispatch({ type: 'TICK' })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, state.remaining, state.phase, synced])

  // Sync from socket events (group rooms)
  function applySync(payload) {
    dispatch({ type: 'SYNC', payload })
  }

  return {
    ...state,
    isRunning,
    start:  () => { getAudioCtx(); dispatch({ type: 'START' }) },
    pause:  () => dispatch({ type: 'PAUSE' }),
    resume: () => dispatch({ type: 'RESUME' }),
    skip:   () => dispatch({ type: 'SKIP' }),
    reset:  () => dispatch({ type: 'RESET' }),
    applySync,
    dispatch,
  }
}
