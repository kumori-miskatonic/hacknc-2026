import { useEffect, useState } from 'react'
import { logoutUser, observeAuthState } from '../auth/auth'
import './MenuBar.css'

function MenuBar() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    try {
      return observeAuthState(setUser)
    } catch (authError) {
      queueMicrotask(() => setError(authError.message))
      return undefined
    }
  }, [])

  async function handleLogout() {
    setError('')
    setIsLoggingOut(true)

    try {
      await logoutUser()
    } catch (authError) {
      setError(authError.message || 'Unable to log out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user && !error) {
    return null
  }

  return (
    <header className="menu-bar">
      <strong className="menu-brand">HackNC</strong>
      {user && (
        <div className="menu-account">
          <span className="menu-user-name">
            {user.displayName || user.email}
          </span>
          <button
            className="menu-logout"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      )}
      {error && (
        <p className="menu-error" role="alert">
          {error}
        </p>
      )}
    </header>
  )
}

export default MenuBar