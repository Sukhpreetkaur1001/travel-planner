import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import TripCard from '../components/Shared/TripCard'

const Dashboard = () => {
  const { user, logout, hasActivePlan, trialExpired } = useAuth()
  const navigate = useNavigate()

  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [tripToDelete, setTripToDelete] = useState(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const response = await api.get('/trips')
      setTrips(response.data || [])
    } catch (err) {
      console.error('Error fetching trips:', err)
      setError(err.response?.data?.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!tripToDelete) return

    try {
      await api.delete(`/trips/${tripToDelete._id}`)

      setTrips(prev =>
        prev.filter(trip => trip._id !== tripToDelete._id)
      )

      setTripToDelete(null)
    } catch (err) {
      console.error('Error deleting trip:', err)
      setError(err.response?.data?.message || 'Failed to delete trip')
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    return trip.status === filter
  })

  const stats = {
    total: trips.length,
    planning: trips.filter(trip => trip.status === 'planning').length,
    booked: trips.filter(trip => trip.status === 'booked').length,
    completed: trips.filter(trip => trip.status === 'completed').length
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Traveler'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container dashboard-shell">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your trips...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="container dashboard-shell">
        {trialExpired && (
          <div className="alert alert-warning dashboard-alert">
            Your free trial has expired. Choose a paid plan to keep planning trips.
          </div>
        )}

        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="dashboard-kicker">Travel Command Center</span>
            <h1>Hii, {firstName}</h1>
            <p>
              {hasActivePlan
                ? 'Track every itinerary, review upcoming plans and start your next journey from one clean workspace.'
                : trialExpired
                  ? 'Your trial has expired. Choose a paid subscription to continue planning trips.'
                  : 'Your dashboard is ready. To start planning new trips, activate a subscription or use your free trial.'}
            </p>
            <div className="dashboard-hero-actions">
              {hasActivePlan ? (
                <Link to="/planner">
                  <Button variant="primary">Plan New Trip</Button>
                </Link>
              ) : (
                <Link to="/subscription">
                  <Button variant="primary">Choose a Plan</Button>
                </Link>
              )}
              <Button variant="ghost" onClick={fetchTrips}>Refresh</Button>
            </div>
            {!hasActivePlan && (
              <p className="dashboard-note">
                Trip planning is locked until you select a subscription plan. Choose a plan below to unlock the planner.
              </p>
            )}
          </div>

          <div className="dashboard-hero-card">
            <span>Active plans</span>
            <strong>{stats.planning}</strong>
            <p>{stats.total} total {stats.total === 1 ? 'trip' : 'trips'} saved</p>
          </div>
        </section>

        <section className="stats-grid">
          <Card className="stat-card">
            <div className="stat-icon stat-icon-total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Trips</span>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon stat-icon-planning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.planning}</span>
              <span className="stat-label">Planning</span>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon stat-icon-booked">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.booked}</span>
              <span className="stat-label">Booked</span>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon stat-icon-completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </Card>
        </section>

        <section className="trips-section">
          <div className="trips-header">
            <div>
              <span className="section-eyebrow">Saved Plans</span>
              <h2>Your Trips</h2>
            </div>
            <div className="trips-filter">
              {['all', 'planning', 'booked', 'completed'].map(item => (
                <button
                  key={item}
                  className={`filter-btn ${filter === item ? 'filter-btn-active' : ''}`}
                  onClick={() => setFilter(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError('')}>x</button>
            </div>
          )}

          {filteredTrips.length === 0 ? (
            <Card className="empty-card">
              <div className="empty-content">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3>No trips yet</h3>
                <p>
                  {hasActivePlan
                    ? (filter === 'all' ? 'Start planning your first adventure.' : `No trips found with status "${filter}".`)
                    : 'A subscription is required to create new trips. Activate your plan to begin.'}
                </p>
                <Link to={hasActivePlan ? '/planner' : '/subscription'}>
                  <Button variant="primary">
                    {hasActivePlan ? 'Plan Your First Trip' : 'Choose a Plan'}
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="trips-grid">
              {filteredTrips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onDelete={() => setTripToDelete(trip)} />
              ))}
            </div>
          )}
        </section>

        <section className="quick-actions">
          <Card className="action-card">
            <div>
              <span className="section-eyebrow">Shortcuts</span>
              <h3>Quick Actions</h3>
            </div>
            <div className="action-buttons">
              <Link to={hasActivePlan ? '/planner' : '/subscription'} className="action-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {hasActivePlan ? 'Plan New Trip' : 'Choose a Plan'}
              </Link>
              <button className="action-link" onClick={fetchTrips}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
              <button className="action-link" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
              {tripToDelete && (
                <div className="delete-overlay">
                  <div className="delete-card">
                    <div className="delete-icon">
                      🗑️
                    </div>

                    <h2>Delete Trip?</h2>

                    <p>
                      Are you sure you want to delete your trip to
                      <span> {tripToDelete.destination}</span>?
                    </p>

                    <div className="delete-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => setTripToDelete(null)}
                      >
                        Cancel
                      </button>

                      <button
                        className="delete-btn"
                        onClick={handleDelete}
                      >
                        Delete Trip
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
