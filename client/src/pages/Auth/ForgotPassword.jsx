import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import Button from '../../components/UI/Button'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/forgot-password', {
        email: email.trim()
      })

      setMessage(response.data.message)
      toast.success('Reset link sent if the email exists')
    } catch (err) {
      const errMessage = err.response?.data?.message || 'Failed to send reset link'
      setError(errMessage)
      toast.error(errMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
            alt="Travel"
            className="auth-image"
          />
          <div className="auth-overlay"></div>
          <div className="auth-visual-content">
            <h2>Reset Your Password</h2>
            <p>We will send a secure reset link to your registered email.</p>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1>Forgot Password</h1>
              <p>Enter your email to receive a reset link</p>
            </div>

            {(error || message) && (
              <div className={error ? 'auth-error' : 'auth-success'}>
                {error || message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                  <span className="input-icon">Email</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <p className="auth-switch">
              Remembered your password?
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
