import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/UI/Button'
import { toast } from 'react-toastify'

const Login = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const { login, error, clearError, loading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [localError, setLocalError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    setLocalError('')
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    const result = await login(
      formData.email,
      formData.password
    )

    if (result) {
      toast.success('Login successful 🚀')

      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1500)

    } else {
      toast.error(error || 'Login failed')
    }
  }
  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-visual">

          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
            alt="Travel"
            className="auth-image"
          />

          <div className="auth-overlay"></div>

          <div className="auth-visual-content">
            <h2>Explore The World</h2>
            <p>
              Plan smart trips with AI powered itineraries,
              luxury stays and unforgettable experiences.
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-section">

          <div className="auth-form-container">

            <div className="auth-form-header">
              <h1>Welcome Back 👋</h1>
              <p>
                Login to continue your travel journey
              </p>
            </div>

            {(localError || error) && (
              <div className="auth-error">
                {localError || error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {/* EMAIL */}
              <div className="form-group">

                <label className="form-label">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />

                  <span className="input-icon">
                    ✉️
                  </span>

                </div>

              </div>

              {/* PASSWORD */}
              <div className="form-group">

                <label className="form-label">
                  Password
                </label>

                <div className="input-wrapper">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />

                  <div className="input-icon">
                    🔒
                  </div>

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>

                </div>

              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <button
              className="demo-btn"
              onClick={() =>
                setFormData({
                  email: 'demo@example.com',
                  password: 'demo123'
                })
              }
            >
              Use Demo Account
            </button>

            <p className="auth-switch">
              Don’t have an account?
              <Link to="/signup">
                Signup
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
