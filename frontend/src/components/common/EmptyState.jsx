function EmptyState({
  title = 'Nothing here yet',
  message = 'Try a different filter or add something new.',
  actionLabel,
  onAction,
}) {
  return (
    <section className="state-card" aria-live="polite">
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
