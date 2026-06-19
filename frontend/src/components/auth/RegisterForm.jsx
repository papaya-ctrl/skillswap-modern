import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const initialValues = {
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
}

function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
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
      const data = await register(values)

      navigate('/login', {
        replace: true,
        state: {
          message: data.message,
        },
      })
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
      {formMessage ? <p className="form__message">{formMessage}</p> : null}

      <div className="field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
        />
        {errors.name ? <p className="field__error">{errors.name[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
        />
        {errors.username ? <p className="field__error">{errors.username[0]}</p> : null}
      </div>

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
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
        />
        {errors.password ? <p className="field__error">{errors.password[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="password_confirmation">Confirm password</label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
    </form>
  )
}

export default RegisterForm
