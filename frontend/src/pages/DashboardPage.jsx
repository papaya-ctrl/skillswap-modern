import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="stack stack--page">
      <header className="dashboard-card hero-card">
        <div className="stack">
          <p className="hero-card__eyebrow">Dashboard</p>
          <h1 className="page-heading">Welcome back, {user?.name ?? user?.username}.</h1>
          <p className="page-copy">
            This page is your quick checkpoint for the current signed-in session.
            From here you can jump into posting, update your public profile, or
            continue SkillSwap conversations.
          </p>
        </div>

        <div className="hero-card__actions dashboard-card__actions">
          <Link className="button" to="/posts/new">
            Create post
          </Link>
          <Link className="button--ghost" to="/inbox">
            Open inbox
          </Link>
          <Link className="button--ghost" to="/settings/profile">
            Edit profile
          </Link>
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Account overview</h2>
          <p>Your frontend session is currently hydrated from the Laravel Sanctum `GET /api/me` endpoint.</p>
          <ul className="dashboard-list">
            <li>Name: {user?.name}</li>
            <li>Username: @{user?.username}</li>
            <li>Email: {user?.email}</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Suggested checks</h2>
          <p>Use these links when you want to confirm your public profile and owner-only flows still look correct.</p>
          <div className="hero-card__actions dashboard-card__actions">
            <Link className="button--ghost" to={`/profiles/${user?.id}`}>
              View public profile
            </Link>
            <Link className="button--ghost" to="/">
              Browse feed
            </Link>
          </div>
        </article>
      </section>
    </section>
  )
}

export default DashboardPage
