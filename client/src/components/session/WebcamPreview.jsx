import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, ChevronDown, ChevronUp, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS = {
  focused:    { border: 'border-accent-teal',   ring: 'shadow-[0_0_16px_rgba(20,184,166,0.4)]',  dot: 'bg-accent-teal',  label: 'Focused',        text: 'text-accent-teal' },
  idle:       { border: 'border-accent-amber',  ring: 'shadow-[0_0_16px_rgba(245,158,11,0.3)]',  dot: 'bg-accent-amber', label: 'Look at camera', text: 'text-accent-amber' },
  distracted: { border: 'border-accent-red',    ring: 'shadow-[0_0_16px_rgba(239,68,68,0.4)]',   dot: 'bg-accent-red',   label: 'Distracted',     text: 'text-accent-red' },
  phone:      { border: 'border-accent-red',    ring: 'shadow-[0_0_16px_rgba(239,68,68,0.4)]',   dot: 'bg-accent-red',   label: 'Phone detected', text: 'text-accent-red' },
  untracked:  { border: 'border-white/10',      ring: '',                                          dot: 'bg-text-muted',   label: 'No tracking',    text: 'text-text-muted' },
}

export default function WebcamPreview({ enabled, onStreamReady, videoRef: externalRef, focusState = 'untracked', phoneDetected = false }) {
  const internalRef = useRef(null)
  const videoRef = externalRef || internalRef
  const [hasPermission, setHasPermission] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  const displayState = phoneDetected ? 'phone' : (focusState || 'untracked')
  const cfg = STATUS[displayState] || STATUS.untracked

  useEffect(() => {
    if (!enabled) { setHasPermission(false); return }

    let stream = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setHasPermission(true)
        onStreamReady?.(stream)
      } catch {
        setHasPermission(false)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [enabled])

  if (!enabled || hasPermission === false) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-white/10 text-text-muted text-xs">
        <CameraOff size={14} />
        <span>Camera off</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Status pill — always visible */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-surface border ${cfg.border} transition-all duration-300 ${cfg.ring}`}
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${displayState === 'focused' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
        {phoneDetected && <Smartphone size={11} className="text-accent-red" />}
        {collapsed ? <ChevronUp size={11} className="text-text-muted ml-1" /> : <ChevronDown size={11} className="text-text-muted ml-1" />}
      </button>

      {/* Camera view */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`relative w-52 h-40 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${cfg.border} ${cfg.ring}`}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />

            {hasPermission === null && (
              <div className="absolute inset-0 bg-bg-card flex items-center justify-center">
                <Camera size={24} className="text-text-muted animate-pulse" />
              </div>
            )}

            {/* Phone warning overlay */}
            <AnimatePresence>
              {phoneDetected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-accent-red/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2"
                >
                  <Smartphone size={28} className="text-accent-red" />
                  <p className="text-xs font-semibold text-accent-red text-center px-2">Put the phone down!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rec dot */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-medium">REC</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
