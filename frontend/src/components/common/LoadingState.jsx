function LoadingState({ title = 'Loading', message = 'Please wait.' }) {
  return (
    <section className="state-card" aria-live="polite">
      <h1>{title}</h1>
      <p>{message}</p>
    </section>
  )
}

export default LoadingState
