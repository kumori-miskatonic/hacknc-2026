import { useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('login')

  return page === 'register' ? (
    <Register onLogin={() => setPage('login')} />
  ) : (
    <Login onRegister={() => setPage('register')} />
  )
}

export default App
