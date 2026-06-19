import { Navigate } from 'react-router-dom'
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
        <h1>Create your account</h1>
        <p>Register first, then sign in with the new credentials.</p>
        <RegisterForm />
      </div>
    </section>
  )
}

export default RegisterPage
