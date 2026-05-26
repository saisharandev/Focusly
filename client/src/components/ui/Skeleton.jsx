import { clsx } from '../../lib/utils'

export default function Skeleton({ className = '' }) {
  return (
    <div className={clsx('bg-white/5 animate-pulse rounded-xl', className)} />
  )
}
