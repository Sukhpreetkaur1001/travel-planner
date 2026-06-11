import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/UI/Button'
import api from '../utils/api'

const plans = [
  { id: 'trial', title: '7-day Free Trial', price: 'Free' },
  { id: 'monthly', title: '1 Month', price: '₹499 / $6.99' },
  { id: '3-month', title: '3 Months', price: '₹1,299 / $16.99' },
  { id: '6-month', title: '6 Months', price: '₹2,399 / $29.99' },
  { id: 'yearly', title: '1 Year', price: '₹4,199 / $49.99' }
]

const planDetails = {
  trial: {
    badge: 'Free Trial',
    desc: 'Perfect to test the waters and explore our planning features.',
    features: [
      '7 days full access to tools',
      'AI-Powered itineraries',
      'Hotel budget recommendations',
      'Standard customer support'
    ]
  },
  monthly: {
    badge: 'Flexible',
    desc: 'Flexible plan for a single quick getaway trip.',
    features: [
      'Full planner access',
      'AI Itineraries & edits',
      'Local transport bookings',
      'Weather forecasts',
      'Standard support'
    ]
  },
  '3-month': {
    badge: 'Seasonal',
    desc: 'Great for occasional travelers going on seasonal holidays.',
    features: [
      'All monthly plan features',
      'Unlimited itinerary generation',
      'PDF exports and offline downloads',
      'Geoapify location tagging',
      'Priority email support'
    ]
  },
  '6-month': {
    badge: 'Best Value',
    desc: 'Perfect for frequent flyers and digital nomads exploring.',
    features: [
      'All 3-month features',
      'Multi-city routing plans',
      'Offline PDF export access',
      'Weather alert updates',
      '24/7 priority support'
    ]
  },
  yearly: {
    badge: 'Ultimate Saver',
    desc: 'Ultimate option for lifetime travelers and travel managers.',
    features: [
      'Unrestricted premium access for 1 year',
      'Save 40% compared to monthly',
      'Early access to new features',
      'All PDF export templates',
      '24/7 dedicated support line'
    ]
  }
}

export default function Subscription() {
  console.log('Render Subscription page')
  const { user, selectPlan, refreshUser, canUseTrial, trialExpired } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const trialActive = user?.plan === 'trial' && user?.planExpiry && new Date(user.planExpiry) > new Date()
  const trialAvailable = user?.plan === 'trial' || canUseTrial

  const handleSelect = async (planId) => {
    setLoading(true)
    setMessage('')
    try {
      if (planId === 'trial') {
        const ok = await selectPlan(planId)
        setMessage(ok ? 'Plan updated' : 'Failed to update plan')
      } else {
        const resp = await api.post('/payments/create-session', { plan: planId })
        window.location.href = resp.data.url
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to initiate purchase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (sessionId) {
      (async () => {
        setLoading(true)
        try {
          await api.post('/payments/confirm', { sessionId })
          if (refreshUser) {
            await refreshUser()
          }
          setMessage('Payment successful! Your subscription has been updated.')
          window.history.replaceState({}, '', '/subscription')
        } catch (err) {
          setMessage(err.response?.data?.message || 'Payment confirmation failed')
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [])

  return (
    <div className="page-container subscription-page">
      <div className="subscription-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Choose the Perfect Plan</h1>
        <p className="subscription-summary" style={{ fontSize: '1.1rem', color: '#64748b' }}>
          Current active plan: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user?.plan || 'none'}</strong>
          {user?.planExpiry ? ` (Expires on ${new Date(user.planExpiry).toLocaleDateString()})` : ''}
        </p>
        <p className="subscription-tip" style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '700px', margin: '12px auto 0 auto', lineHeight: 1.6 }}>
          Unlock the fully personalized AI itinerary planner, hotel recommendations, transport ticketing, and weather updates. Choose a plan below to continue.
        </p>
      </div>

      {trialExpired && (
        <div className="alert alert-warning" style={{ margin: '20px auto 40px auto', maxWidth: '800px', borderRadius: '16px' }}>
          Your 7-day trial has expired. Choose a paid plan below to continue planning trips.
        </div>
      )}

      <div className="plans-grid">
        {plans
          .filter(p => p.id !== 'trial' || trialAvailable)
          .map(p => {
            const isCurrentPlan = user?.plan === p.id
            const isExpiredTrial = p.id === 'trial' && isCurrentPlan && !trialActive
            const buttonLabel = isCurrentPlan
              ? isExpiredTrial ? 'Trial expired' : 'Current plan'
              : 'Choose plan'
            
            const details = planDetails[p.id]

            return (
              <div key={p.id} className={`plan-card ${isCurrentPlan ? 'selected' : ''}`}>
                {details?.badge && (
                  <span className="plan-card-badge">
                    {details.badge}
                  </span>
                )}
                
                <div className="plan-card-top">
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{p.title}</h3>
                  <p className="plan-desc" style={{ minHeight: '48px', fontSize: '0.88rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                    {details?.desc}
                  </p>
                  
                  <div className="plan-price-box" style={{ marginBottom: '24px' }}>
                    <span className="plan-price-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00AA6C' }}>{p.price}</span>
                  </div>
                  
                  {isExpiredTrial && (
                    <p className="plan-status" style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
                      Your trial has expired
                    </p>
                  )}
                </div>

                <ul className="plan-features-list">
                  {details?.features?.map((feat, idx) => (
                    <li key={idx} className="plan-feature-item">
                      <span className="plan-feature-icon">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(p.id)}
                  disabled={loading || isCurrentPlan}
                  variant={isCurrentPlan ? 'outline' : 'primary'}
                  className="plan-action-btn"
                  style={{ marginTop: '20px' }}
                >
                  {buttonLabel}
                </Button>
              </div>
            )
          })}
      </div>

      {message && (
        <p className="muted" style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
          {message}
        </p>
      )}
    </div>
  )
}
