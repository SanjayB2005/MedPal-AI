import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import History from './pages/History'

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={user ? <Layout /> : <Navigate to="/" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
