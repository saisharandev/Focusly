import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, Camera, CameraOff, Info } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import SubjectCombobox from '../../components/session/SubjectCombobox'

const PRESET_DURATIONS = [25, 45, 60, 90]

export default function SessionSetup() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState(25)
  const [customDuration, setCustomDuration] = useState('')
  const [timerMode, setTimerMode] = useState('pomodoro')
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const activeDuration = customDuration ? Number(customDuration) : duration

  function handleStart() {
    if (!activeDuration || activeDuration < 1) return
    const sessionState = { subject: subject || 'General', goal, duration: activeDuration, timerMode, cameraEnabled }
    sessionStorage.removeItem('activeSessionId')
    sessionStorage.removeItem('activeSessionStart')
    sessionStorage.setItem('activeSession', JSON.stringify(sessionState))
    navigate('/session/active', { state: sessionState })
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">New Focus Session</h1>
        <p className="text-text-muted text-sm mt-1">Set up your session and stay accountable.</p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Subject */}
        <SubjectCombobox value={subject} onChange={setSubject} />

        {/* Goal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Session Goal (optional)</label>
          <textarea
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal resize-none transition-colors"
            rows={2}
            placeholder="e.g. Finish chapter 4, solve 10 problems..."
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Duration</label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => { setDuration(d); setCustomDuration('') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  duration === d && !customDuration
                    ? 'bg-accent-teal text-bg-base'
                    : 'bg-bg-card text-text-secondary border border-white/10 hover:border-white/20'
                }`}
              >
                {d}m
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={240}
              placeholder="Custom"
              value={customDuration}
              onChange={e => { setCustomDuration(e.target.value); setDuration(0) }}
              className="w-20 bg-bg-card border border-white/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal text-center"
            />
          </div>
        </div>

        {/* Timer mode */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Timer Mode</label>
          <div className="flex gap-2">
            {['pomodoro', 'continuous'].map(mode => (
              <button
                key={mode}
                onClick={() => setTimerMode(mode)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  timerMode === mode
                    ? 'bg-accent-teal text-bg-base'
                    : 'bg-bg-card text-text-secondary border border-white/10 hover:border-white/20'
                }`}
              >
                {mode === 'pomodoro' ? '🍅 Pomodoro' : '⏱ Continuous'}
              </button>
            ))}
          </div>
        </div>

        {/* Camera toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-bg-card border border-white/10">
          <div className="flex items-start gap-3">
            {cameraEnabled ? (
              <Camera size={18} className="text-accent-teal mt-0.5" />
            ) : (
              <CameraOff size={18} className="text-text-muted mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-text-primary">Camera Tracking</p>
              <p className="text-xs text-text-muted mt-0.5">
                Focusly uses your camera locally to detect if you're at your desk.{' '}
                <span className="text-accent-teal">No video is recorded or sent.</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setCameraEnabled(c => !c)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              cameraEnabled ? 'bg-accent-teal' : 'bg-bg-card border border-white/20'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              cameraEnabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        <Button onClick={handleStart} className="w-full" size="lg" disabled={!activeDuration || activeDuration < 1}>
          <Timer size={18} />
          Start Session
        </Button>
      </Card>
    </div>
  )
}
