import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

export default function WebcamPreview({ enabled, onStreamReady, videoRef: externalRef }) {
  const internalRef = useRef(null)
  const videoRef = externalRef || internalRef
  const [hasPermission, setHasPermission] = useState(null) // null=pending, true, false

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
      <div className="w-36 h-28 rounded-xl bg-bg-card border border-white/10 flex flex-col items-center justify-center gap-1.5 text-text-muted">
        <CameraOff size={20} />
        <span className="text-xs">Camera off</span>
      </div>
    )
  }

  return (
    <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-white/10">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
      />
      {hasPermission === null && (
        <div className="absolute inset-0 bg-bg-card flex items-center justify-center">
          <Camera size={20} className="text-text-muted animate-pulse" />
        </div>
      )}
      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full animate-pulse" />
    </div>
  )
}
