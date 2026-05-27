import { useState, useRef, useEffect } from 'react'

export default function useSessionTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  function start() {
    if (isRunning) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)
  }

  function startFrom(seconds) {
    if (isRunning) return
    setElapsedSeconds(seconds)
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)
  }

  function pause() {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }

  function stop() {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }

  function reset() {
    stop()
    setElapsedSeconds(0)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return { elapsedSeconds, isRunning, start, startFrom, pause, stop, reset }
}
