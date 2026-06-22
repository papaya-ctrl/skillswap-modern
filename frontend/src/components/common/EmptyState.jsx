function EmptyState({
  title = 'Nothing here yet',
  message = 'Try a different filter or add something new.',
  actionLabel,
  onAction,
  eyebrow = 'Nothing here yet',
  compact = false,
}) {
  return (
    <section
      className={`state-card${compact ? ' state-card--compact' : ''}`}
      aria-live="polite"
    >
      <p className="state-card__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{message}</p>

      {actionLabel && onAction ? (
        <div className="state-card__actions">
          <button type="button" className="button" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default EmptyState
