import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const initialValues = {
  email: '',
  password: '',
}

function LoginForm({ successMessage = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setFormMessage('')

    try {
      await login(values)
      const nextPath = location.state?.from?.pathname ?? '/dashboard'
      navigate(nextPath, { replace: true })
    } catch (error) {
      if (error.type === 'validation') {
        setErrors(error.errors)
      } else {
        setFormMessage(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {successMessage ? <p className="form__success">{successMessage}</p> : null}
      {formMessage ? <p className="form__message">{formMessage}</p> : null}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
        />
        {errors.email ? <p className="field__error">{errors.email[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
        />
        {errors.password ? <p className="field__error">{errors.password[0]}</p> : null}
      </div>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm
