import MenuBar from './components/MenuBar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import './App.css'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <MenuBar />
      <Routes>
        <Route path="/" element={<Login />} /> {/* Start at the Login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h1>404 - Page not found</h1>} /> {/* When there isn't a page */}
      </Routes>
    </>
  )
}

export default App
