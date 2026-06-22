import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-card hero-card">
      <div className="stack">
        <p className="hero-card__eyebrow">Protected page</p>
        <h1 className="page-heading">Hi, {user?.name ?? user?.username}.</h1>
        <p className="page-copy">
          You are authenticated through Laravel Sanctum. Use this page as a quick
          checkpoint for the current signed-in session, then jump back into the post flow.
        </p>
      </div>

      <div className="panel">
        <h2>Current auth payload</h2>
        <p>The frontend is using the `GET /api/me` response to hydrate auth state.</p>
        <ul>
          <li>Name: {user?.name}</li>
          <li>Username: @{user?.username}</li>
          <li>Email: {user?.email}</li>
        </ul>

        <div className="hero-card__actions dashboard-card__actions">
          <Link className="button" to="/settings/profile">
            Edit profile
          </Link>
          <Link className="button--ghost" to={`/profiles/${user?.id}`}>
            View public profile
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
