import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard'
import TripBuilder from './pages/Planner/TripBuilder'
import Itinerary from './pages/Planner/Itinerary'
import Subscription from './pages/Subscription'
import ThingsToDo from './pages/ThingsToDo'
import Hotels from './pages/Hotels'
import Restaurants from './pages/Restaurants'
import 'leaflet/dist/leaflet.css';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute:', location.pathname, isAuthenticated, loading)

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function App() {
  const { isAuthenticated, hasActivePlan, loading } = useAuth()

  const PlanAccessRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      )
    }

    return hasActivePlan ? children : <Navigate to="/subscription" replace />
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/things-to-do" element={<ThingsToDo />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner/:id?"
            element={
              <ProtectedRoute>
                <PlanAccessRoute>
                  <TripBuilder />
                </PlanAccessRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itinerary/:id"
            element={
              <ProtectedRoute>
                <Itinerary />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App