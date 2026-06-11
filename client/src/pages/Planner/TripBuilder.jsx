import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import api from '../../utils/api'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'


const TripBuilder = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const location = useLocation()

  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: 1000,
    travelers: 1,
    travelerType: 'mixed',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditMode) {
      api.get(`/trips/${id}`).then(res => {
        const t = res.data
        setFormData({
          originCity: t.originCity || '',
          originCountry: t.originCountry || '',
          destination: t.destination || '',
          country: t.country || '',
          startDate: t.startDate ? t.startDate.split('T')[0] : '',
          endDate: t.endDate ? t.endDate.split('T')[0] : '',
          budget: t.budget || 1000,
          travelers: t.travelers || 1,
          travelerType: t.travelerType || 'mixed',
          notes: t.notes || ''
        })
      }).catch(() => setError('Failed to load trip data'))
    }
  }, [id, isEditMode])



  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value, 10)
    }));

    setError('');
  };

  const validateForm = () => {
    if (!formData.originCity.trim()) return 'Please enter your starting city'
    if (!formData.originCountry.trim()) return 'Please enter your starting country'
    if (!formData.destination.trim()) return 'Please enter a destination'
    if (!formData.country.trim()) return 'Please enter a country'
    if (!formData.startDate) return 'Please select a start date'
    if (!formData.endDate) return 'Please select an end date'
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return 'End date must be after start date'
    }
    if (formData.budget < 100) return 'Minimum budget is $100'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {

      let response

      const tripData = {
        originCity: formData.originCity.trim(),
        originCountry: formData.originCountry.trim(),
        destination: formData.destination.trim(),
        country: formData.country.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        travelers: formData.travelers,
        travelerType: formData.travelerType,
        notes: formData.notes.trim()
      }

      if (isEditMode) {

        response = await api.put(`/trips/${id}`, tripData)

      } else {

        response = await api.post('/trips', tripData)

      }

      if (response.data?._id) {
        navigate(`/itinerary/${response.data._id}`)
      }

    } catch (err) {

      console.error('Trip save error:', err)

      setError(
        err.response?.data?.message ||
        'Failed to save trip. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const getDuration = () => {
    if (!formData.startDate || !formData.endDate) return 'Select dates'
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (start > end) return 'Check dates'
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const steps = [
    {
      title: 'Destination',
      text: 'Choose the place',
      complete: Boolean(formData.destination.trim() && formData.country.trim())
    },
    {
      title: 'Details',
      text: 'Dates and budget',
      complete: Boolean(formData.startDate && formData.endDate && formData.budget >= 100)
    },
    {
      title: 'Review',
      text: 'Generate plan',
      complete: false
    }
  ]


  const isIndianUser =
    formData.originCountry.trim().toLowerCase() === "india";

    const daysLeft = formData.startDate
  ? Math.ceil(
      (new Date(formData.startDate) - new Date()) /
      (1000 * 60 * 60 * 24)
    )
  : 0;

  return (
    <div className="planner-page">
      <div className="container planner-shell">
        <section className="planner-hero">
          <div className="planner-hero-copy">
            <span className="planner-tag">AI Travel Planner</span>
            <h1 className="planner-title">Plan Your Dream Trip</h1>
            <p className="planner-subtitle">
              Build a polished itinerary with smart dates, budget planning, hotel picks and day-by-day activities.
            </p>
          </div>

          <div className="planner-hero-panel">
            <span>Trip readiness</span>
            <strong>{steps.filter(step => step.complete).length}/3</strong>
          </div>
        </section>

        <div className="planner-steps">
          {steps.map((item, index) => (
            <div
              key={item.title}
              className={`step ${item.complete ? 'step-completed' : ''} ${index === steps.findIndex(step => !step.complete) ? 'step-active' : ''}`}
            >
              <div className="step-number">{item.complete ? 'OK' : index + 1}</div>
              <div>
                <span className="step-label">{item.title}</span>
                <small>{item.text}</small>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="planner-grid">
          <Card className="planner-form-card">
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-section">
              <div className="form-section-heading">
                <div className="form-section-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="form-section-title">Destination Details</h3>
                  <p>Tell us where you start and where you want to go.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="originCity">Starting City</label>
                  <input
                    id="originCity"
                    type="text"
                    name="originCity"
                    className="form-input"
                    placeholder="Delhi, Mumbai, London..."
                    value={formData.originCity}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="originCountry">Starting Country</label>
                  <input
                    id="originCountry"
                    type="text"
                    name="originCountry"
                    className="form-input"
                    placeholder="India, USA, France..."
                    value={formData.originCountry}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="destination">Destination City</label>
                  <input
                    id="destination"
                    type="text"
                    name="destination"
                    className="form-input"
                    placeholder="Paris, Tokyo, Dubai..."
                    value={formData.destination}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    className="form-input"
                    placeholder="France, Japan..."
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-heading">
                <div className="form-section-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="form-section-title">Travel Dates</h3>
                  <p>Pick the window for your itinerary.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    className="form-input"
                    min={getTodayDate()}
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="endDate">End Date</label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    className="form-input"
                    min={formData.startDate || getTodayDate()}
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-heading">
                <div className="form-section-icon">
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: "700"
                    }}
                  >
                    {isIndianUser ? "₹" : "$"}
                  </span>
                </div>
                <div>
                  <h3 className="form-section-title">Budget & Travelers</h3>
                  <p>Set the practical shape of the trip.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="budget">Budget</label>
                  <input
                    id="budget"
                    type="number"
                    name="budget"
                    min="100"
                    step="50"
                    className="form-input"
                    value={formData.budget}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="travelers">Travelers</label>
                  <select
                    id="travelers"
                    name="travelers"
                    className="form-select"
                    value={formData.travelers}
                    onChange={handleNumberChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Traveler' : 'Travelers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Who's Traveling?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                  {[
                    { value: 'girls', label: 'Girls Only', emoji: '👩' },
                    { value: 'boys', label: 'Boys Only', emoji: '👨' },
                    { value: 'mixed', label: 'Mixed Group', emoji: '👫' },
                    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, travelerType: type.value }))}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '16px',
                        border: `2px solid ${formData.travelerType === type.value ? 'var(--primary)' : '#e2e8f0'}`,
                        background: formData.travelerType === type.value ? 'var(--primary-light)' : '#fff',
                        color: formData.travelerType === type.value ? 'var(--primary)' : '#334155',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: '0.2s'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{type.emoji}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section form-section-last">
              <div className="form-section-heading">
                <div className="form-section-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="form-section-title">Additional Notes</h3>
                  <p>Add preferences, pace, food, stays or must-see places.</p>
                </div>
              </div>

              <textarea
                name="notes"
                className="form-textarea"
                placeholder="Example: relaxed mornings, boutique hotels, local food, museums, sunset views..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </Card>

          <aside className="summary-card">
            <span className="summary-badge">Live Summary</span>
            <h3>Your Trip</h3>

            <div className="summary-preview">
              <div className="summary-destination-mark">
                {(formData.destination || 'W').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{formData.destination || 'Not Selected'}</strong>
                <span>
                  {formData.originCity && formData.destination
                    ? `${formData.originCity} to ${formData.destination}`
                    : formData.country || 'Choose a country'}
                </span>
              </div>
            </div>

            <div className="summary-item">
              <span>Dates</span>
              <strong>{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</strong>
            </div>

            <div className="summary-item">
              <span>Duration</span>
              <strong>{getDuration()}</strong>
            </div>

            {daysLeft > 0 && (
  <div className="summary-item">
    <span>Countdown</span>
    <strong>⏳ {daysLeft} days left</strong>
  </div>
)}

            <div className="summary-item">
              <span>Trip Type</span>
              <strong>
                {formData.budget < 30000
                  ? "💰 Budget Friendly"
                  : formData.budget < 100000
                    ? "✨ Premium Trip"
                    : "👑 Luxury Trip"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Budget</span>

              <strong>
                {isIndianUser
                  ? `₹${formData.budget.toLocaleString('en-IN')}`
                  : `$${formData.budget.toLocaleString()}`}
              </strong>
            </div>


            <div className="summary-item">
              <span>Travelers</span>
              <strong>{formData.travelers}</strong>
            </div>

            <div className="summary-item">
              <span>Per Person Cost</span>
              <strong>
                {isIndianUser
                  ? `₹${Math.round(formData.budget / (formData.travelers || 1)).toLocaleString('en-IN')}`
                  : `$${Math.round(formData.budget / (formData.travelers || 1)).toLocaleString()}`}
              </strong>
            </div>

            <div className="summary-item">
              <span>Destination Country</span>
              <strong>{formData.country || 'Not Selected'}</strong>
            </div>

            <div className="summary-item">
              <span>Completion</span>
              <strong>
                {Math.round((steps.filter(step => step.complete).length / 3) * 100)}%
              </strong>
            </div>



            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {isEditMode ? 'Update Trip' : 'Generate Itinerary'}            </Button>
          </aside>
        </form>
      </div>
    </div >
  )
}

export default TripBuilder
