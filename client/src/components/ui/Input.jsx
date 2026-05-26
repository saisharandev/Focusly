import { clsx } from '../../lib/utils'

export default function Input({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <input
        type={type}
        className={clsx(
          'w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 text-text-primary',
          'placeholder:text-text-muted text-sm',
          'focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal',
          'transition-colors duration-150',
          error && 'border-accent-red focus:border-accent-red focus:ring-accent-red',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
}
