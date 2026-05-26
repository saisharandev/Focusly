import { clsx } from '../../lib/utils'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
