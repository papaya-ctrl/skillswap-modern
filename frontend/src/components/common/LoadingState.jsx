function LoadingState({
  title = 'Loading',
  message = 'Please wait.',
  eyebrow = 'Loading',
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
    </section>
  )
}

export default LoadingState
