import { useState } from 'react'
import { registerUser, signInWithGoogle } from '../auth/auth'
import './Login.css'
import { Link, useNavigate } from 'react-router-dom'

function firebaseErrorMessage(error) {
  const messages = {
    'auth/configuration-not-found':
      'Firebase Authentication is not configured for this project. In Firebase Console, open Authentication > Sign-in method and enable Email/Password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/operation-not-allowed':
      'Email and password accounts are not enabled in Firebase.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
    'auth/weak-password': 'Choose a stronger password.',
  }

  return messages[error.code] || error.message || 'Registration failed.'
}

function Register() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setIsLoading(true)

    try {
      await registerUser(email, password, displayName)
      navigate('/dashboard')
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
      navigate('/dashboard')
    } catch (error) {
      setStatus({ type: 'error', message: firebaseErrorMessage(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="register-title">
        <h1 id="register-title">Create your account</h1>
        <p className="login-subtitle">
          Sign up to get started with your account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="display-name">Name</label>
          <input
            id="display-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password" className="link-txt">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="6"
            required
          />

          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength="6"
            required
          />

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>
        <button
          className="google-button general-ui-button"
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
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
