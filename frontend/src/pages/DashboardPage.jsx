import { useAuth } from '../hooks/useAuth.js'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-card hero-card">
      <div className="stack">
        <p className="hero-card__eyebrow">Protected page</p>
        <h1 className="page-heading">Hi, {user?.name ?? user?.username}.</h1>
        <p className="page-copy">
          You are authenticated through Laravel Sanctum. This placeholder confirms
          protected routing and restored session state for the new frontend.
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
      </div>
    </section>
  )
}

export default DashboardPage
