import { useState, useEffect, useRef } from 'react'

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
const OBJ_MODEL = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite'
const INTERVAL_MS = 3000

export default function useFaceDetection(videoRef, { enabled = true } = {}) {
  const [faceDetected, setFaceDetected] = useState(false)
  const [phoneDetected, setPhoneDetected] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const faceDetectorRef = useRef(null)
  const objDetectorRef = useRef(null)
  const intervalRef = useRef(null)
  const faceDetectedRef = useRef(false)
  const phoneDetectedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function init() {
      try {
        const { FaceDetector, ObjectDetector, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH)

        // Load face + phone detectors in parallel
        const [faceDetector, objDetector] = await Promise.all([
          FaceDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL },
            runningMode: 'VIDEO',
            minDetectionConfidence: 0.5,
          }),
          ObjectDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath: OBJ_MODEL },
            runningMode: 'VIDEO',
            scoreThreshold: 0.4,
            categoryAllowlist: ['cell phone'],
          }),
        ])

        if (cancelled) { faceDetector.close(); objDetector.close(); return }
        faceDetectorRef.current = faceDetector
        objDetectorRef.current = objDetector
        setIsLoaded(true)

        intervalRef.current = setInterval(() => {
          const video = videoRef.current
          if (!video || video.readyState < 2) return
          const ts = performance.now()

          try {
            const faceResult = faceDetector.detectForVideo(video, ts)
            const face = faceResult.detections.length > 0
            faceDetectedRef.current = face
            setFaceDetected(face)
          } catch {}

          try {
            // Offset by 1ms — each detector tracks timestamps independently
            const objResult = objDetector.detectForVideo(video, ts + 1)
            const phone = objResult.detections.some(d =>
              d.categories.some(c => c.categoryName === 'cell phone' && c.score >= 0.4)
            )
            phoneDetectedRef.current = phone
            setPhoneDetected(phone)
          } catch {}
        }, INTERVAL_MS)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load detectors')
      }
    }

    init()

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
      faceDetectorRef.current?.close()
      objDetectorRef.current?.close()
      faceDetectorRef.current = null
      objDetectorRef.current = null
    }
  }, [enabled])

  return { faceDetected, faceDetectedRef, phoneDetected, phoneDetectedRef, isLoaded, error }
}
