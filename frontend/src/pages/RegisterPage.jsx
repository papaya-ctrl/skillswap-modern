import { Link, Navigate } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm.jsx'
import { useAuth } from '../hooks/useAuth.js'

function RegisterPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <p className="hero-card__eyebrow">Register</p>
        <h1>Create your account</h1>
        <p>Register first, then sign in with the new credentials.</p>
        <RegisterForm />
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Go to login.</Link>
        </p>
      </div>
    </section>
  )
}

export default RegisterPage
