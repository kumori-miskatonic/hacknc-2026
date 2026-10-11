import { Navigate } from 'react-router-dom'

function ProtectedRoute({ user, children }) {
  if (user === undefined) {
    return <p>Checking your session...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
