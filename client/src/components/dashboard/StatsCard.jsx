import { useEffect, useRef, useState } from 'react'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * ease))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

export default function StatsCard({ icon: Icon, label, value, displayValue, color = 'text-accent-teal', isLoading }) {
  const numericTarget = typeof value === 'number' ? value : 0
  const animated = useCountUp(numericTarget)

  if (isLoading) return <Skeleton className="h-28" />

  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold font-mono ${color}`}>
          {displayValue ?? animated}
        </p>
      </div>
    </Card>
  )
}
