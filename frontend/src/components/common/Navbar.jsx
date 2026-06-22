import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  async function handleLogout() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await logout()
      closeMenu()
      navigate('/', { replace: true })
    } catch (error) {
      if (error.status === 401) {
        closeMenu()
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

        <div className="navbar__panel">
          <button
            type="button"
            className="button--ghost navbar__menu-toggle"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
          >
            {isMenuOpen ? 'Close menu' : 'Open menu'}
          </button>

          <nav
            id="primary-navigation"
            className={`navbar__menu${isMenuOpen ? ' navbar__menu--open' : ''}`}
            aria-label="Primary navigation"
          >
            <div className="navbar__links">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={`/profiles/${user.id}`}
                  onClick={closeMenu}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/posts/new"
                  onClick={closeMenu}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Create post
                </NavLink>
                <NavLink
                  to="/inbox"
                  onClick={closeMenu}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Inbox
                </NavLink>
                <NavLink
                  to="/dashboard"
                  onClick={closeMenu}
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
                  onClick={closeMenu}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                >
                  Register
                </NavLink>
              </>
            )}
            </div>

            {isAuthenticated && user ? (
              <p className="navbar__status">Signed in as @{user.username}</p>
            ) : null}

            {errorMessage ? <p className="navbar__error">{errorMessage}</p> : null}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar
