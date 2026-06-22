import { Link, Navigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm.jsx'
import { useAuth } from '../hooks/useAuth.js'

function LoginPage() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <p className="hero-card__eyebrow">Login</p>
        <h1>Welcome back</h1>
        <p>Sign in with your SkillSwap email and password.</p>
        <LoginForm successMessage={location.state?.message ?? ''} />
        <p className="auth-card__footer">
          Need an account? <Link to="/register">Create one here.</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
