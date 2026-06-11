import { Link } from 'react-router-dom'
import heroImage from '../../assets/hero.png'

const TripCard = ({ trip, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return 0
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: { bg: '#e6f7f0', text: '#008755' },
      booked: { bg: '#e8f4fd', text: '#00afef' },
      completed: { bg: '#e6f7f0', text: '#00aa6c' },
      cancelled: { bg: '#ffebe9', text: '#ff5a47' }
    }
    return colors[status] || colors.planning
  }

  const statusStyle = getStatusColor(trip.status)
  const duration = getDuration()
  const activityCount = trip.itinerary?.reduce((acc, day) => acc + (day.activities?.length || 0), 0) || 0
  const coverImage = trip.itinerary?.[0]?.hotel?.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'

  return (
    <div className="trip-card">
      <div className="trip-card-image">
        <img
          src={coverImage}
          alt={trip.destination}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = heroImage
          }}
        />
        <span
          className="trip-status-badge"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {trip.status}
        </span>
      </div>

      <div className="trip-card-content">
        <div className="trip-card-header">
          <div>
            <h3 className="trip-destination">{trip.destination}</h3>
            <span className="trip-country">{trip.country}</span>

            {trip.weather && trip.weather.temperature != null && (
              <div className="trip-weather">
                {(() => {
                  const weatherMap = {
                    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
                    45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
                    61: '🌦️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '❄️', 75: '❄️',
                    80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
                  }
                  return weatherMap[trip.weather.weatherCode] || '🌡️'
                })()} {trip.weather.temperature}°C
              </div>
            )}
          </div>
          <div className="trip-budget">
            <span className="budget-amount">${trip.totalCost?.toLocaleString() || trip.budget.toLocaleString()}</span>
          </div>
        </div>

        <div className="trip-card-details">
          <div className="trip-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>

          <div className="trip-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{duration} days</span>
          </div>

          <div className="trip-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</span>
          </div>
        </div>

        <div className="trip-activities">
          <span className="activities-label">Activities:</span>
          <span className="activities-count">
            {activityCount} activities planned
          </span>
        </div>
      </div>

      <div className="trip-card-actions">
        <Link to={`/itinerary/${trip._id}`} className="trip-action-btn trip-action-view">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Itinerary
        </Link>
        <button className="trip-action-btn trip-action-delete" onClick={() => onDelete && onDelete(trip._id)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TripCard
