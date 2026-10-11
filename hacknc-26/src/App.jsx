import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { observeAuthState } from './auth/auth'
import MenuBar from './components/MenuBar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Chat from './pages/Chat.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    try {
      return observeAuthState(setUser)
    } catch {
      queueMicrotask(() => setUser(null))
      return undefined
    }
  }, [])

  return (
    <>
      <MenuBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:chatKey"
          element={
            <ProtectedRoute user={user}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h1>404 - Page not found</h1>} />
      </Routes>
    </>
  )
}

export default App
