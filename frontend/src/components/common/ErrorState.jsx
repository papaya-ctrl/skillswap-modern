function ErrorState({ title = 'Something went wrong', message, actionLabel, onAction }) {
  return (
    <section className="state-card" role="alert">
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
