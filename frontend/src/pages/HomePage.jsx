import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <section className="hero-card">
        <div className="stack">
          <p className="hero-card__eyebrow">Milestone 3</p>
        </div>

        <div className="stack">
          <h1>Secure sign-in for the modern SkillSwap app.</h1>
          <p>
            This milestone wires the React frontend to Laravel Sanctum using
            cookie-based SPA authentication, protected routes, and clear auth states.
          </p>
        </div>

        <div className="hero-card__actions">
          <Link className="button" to={isAuthenticated ? '/dashboard' : '/login'}>
            {isAuthenticated ? 'Open dashboard' : 'Login'}
          </Link>
          <Link className="button--ghost" to={isAuthenticated ? '/dashboard' : '/register'}>
            {isAuthenticated ? 'Stay protected' : 'Create an account'}
          </Link>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <h2>What works now</h2>
          <p>Register, login, logout, session restore on refresh, and route protection.</p>
        </article>

        <article className="panel">
          <h2>What comes later</h2>
          <p>Posts, profiles, comments, inbox, and messaging stay outside this milestone.</p>
        </article>
      </section>
    </>
  )
}

export default HomePage
