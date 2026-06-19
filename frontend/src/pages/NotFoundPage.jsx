import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="state-card">
      <h1>Page not found</h1>
      <p>The page you requested is not part of the current SkillSwap milestone.</p>
      <div className="state-card__actions">
        <Link className="button" to="/">
          Go home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
