function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction,
  eyebrow = 'Error',
  compact = false,
}) {
  return (
    <section
      className={`state-card${compact ? ' state-card--compact' : ''}`}
      role="alert"
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

export default ErrorState
