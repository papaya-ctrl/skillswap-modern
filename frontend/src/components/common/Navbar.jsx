import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogout() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      if (error.status === 401) {
        navigate('/', { replace: true })
        return
      }

      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="navbar__brand" to="/">
          <span className="navbar__mark">SS</span>
          <span>SkillSwap Modern</span>
        </NavLink>

        <div>
          <nav className="navbar__links" aria-label="Primary navigation">
            <NavLink
              to="/"
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={`/profiles/${user.id}`}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/posts/new"
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Create post
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  className="button--ghost"
                  onClick={handleLogout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>

          {isAuthenticated && user ? (
            <p className="navbar__status">Signed in as @{user.username}</p>
          ) : null}

          {errorMessage ? <p className="navbar__error">{errorMessage}</p> : null}
        </div>
      </div>
    </header>
  )
}

export default Navbar
