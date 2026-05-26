import Button from './Button'

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {icon && <div className="text-5xl">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
        {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  )
}
