import { useEffect, useState } from 'react'
import {
  loginUser,
  observeAuthState,
  resetPassword,
  signInWithGoogle,
} from '../auth/auth'
import './Login.css'
import { Link } from 'react-router-dom'

function firebaseErrorMessage(error) {
  const messages = {
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/user-disabled': 'This account has been disabled.',
  }

  return messages[error.code] || error.message || 'Authentication failed.'
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      return observeAuthState(setUser)
    } catch (error) {
      queueMicrotask(() => {
        setStatus({ type: 'error', message: error.message })
      })
      return undefined
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsLoading(true)

    try {
      await loginUser(email, password)
      setStatus({ type: 'success', message: 'You are signed in.' })
    } catch (error) {
      setStatus({ type: 'error', message: firebaseErrorMessage(error) })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setStatus({ type: '', message: '' })
    setIsLoading(true)

    try {
      await signInWithGoogle()
      setStatus({ type: 'success', message: 'You are signed in.' })
    } catch (error) {
      setStatus({ type: 'error', message: firebaseErrorMessage(error) })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordReset() {
    if (!email) {
      setStatus({ type: 'error', message: 'Enter your email first.' })
      return
    }

    try {
      await resetPassword(email)
      setStatus({ type: 'success', message: 'Password reset email sent.' })
    } catch (error) {
      setStatus({ type: 'error', message: firebaseErrorMessage(error) })
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your account.</p>

        {user && (
          <p className="signed-in" role="status">
            Signed in as {user.email}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="password-label">
            <label htmlFor="password">Password</label>
            <button type="button" onClick={handlePasswordReset}>
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="6"
            required
          />

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>
        <button
          className="google-button"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          Continue with Google
        </button>

        {status.message && (
          <p className={`auth-status ${status.type}`} role="alert">
            {status.message}
          </p>
        )}

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
