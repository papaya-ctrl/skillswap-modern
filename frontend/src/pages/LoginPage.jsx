import { Navigate, useLocation } from 'react-router-dom'
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
        <h1>Welcome back</h1>
        <p>Sign in with your SkillSwap email and password.</p>
        <LoginForm successMessage={location.state?.message ?? ''} />
      </div>
    </section>
  )
}

export default LoginPage
