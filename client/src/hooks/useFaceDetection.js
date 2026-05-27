import { useState, useEffect, useRef } from 'react'

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
const DETECTION_INTERVAL_MS = 3000

export default function useFaceDetection(videoRef, { enabled = true } = {}) {
  const [faceDetected, setFaceDetected] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const detectorRef = useRef(null)
  const intervalRef = useRef(null)
  const faceDetectedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function init() {
      try {
        const { FaceDetector, FilesetResolver } =
          await import('@mediapipe/tasks-vision')

        const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        })

        if (cancelled) { detector.close(); return }
        detectorRef.current = detector
        setIsLoaded(true)

        intervalRef.current = setInterval(() => {
          const video = videoRef.current
          if (!video || video.readyState < 2) return
          try {
            const result = detector.detectForVideo(video, performance.now())
            const detected = result.detections.length > 0
            faceDetectedRef.current = detected
            setFaceDetected(detected)
          } catch {}
        }, DETECTION_INTERVAL_MS)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load face detector')
      }
    }

    init()

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
      detectorRef.current?.close()
      detectorRef.current = null
    }
  }, [enabled])

  return { faceDetected, faceDetectedRef, isLoaded, error }
}
