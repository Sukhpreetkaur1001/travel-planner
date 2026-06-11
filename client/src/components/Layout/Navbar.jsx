import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../UI/Button'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [avatarUpdating, setAvatarUpdating] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const { isAuthenticated, user, logout, updateProfile, hasActivePlan } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
  }, [location])

  const handleLogout = () => {
    setAccountOpen(false)
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'User'
  const currentAvatar = avatarPreview || user?.avatar

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      e.target.value = ''
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Please select an image smaller than 4MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      setAvatarUpdating(true)
      setAvatarPreview(reader.result)
      const updated = await updateProfile({ avatar: reader.result })
      if (!updated) {
        setAvatarPreview('')
        alert('Profile picture upload failed. Please try again.')
      }
      setAvatarUpdating(false)
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = async () => {
    setAvatarUpdating(true)
    setAvatarPreview('')
    const updated = await updateProfile({ avatar: '' })
    if (!updated) {
      alert('Profile picture remove failed. Please try again.')
    }
    setAvatarUpdating(false)
  }

  const handleManageSubscription = () => {
    setAccountOpen(false)
    navigate('/subscription')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="#00AA6C" />
            <path d="M19 5L2 12.5L9.5 14.5L16.5 8.5L10.5 15.5L12.5 22L19 5Z" fill="white" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#000000', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.5px' }}>Wanderlust</span>
        </Link>

        <div className={`navbar-menu ${mobileOpen ? 'navbar-menu-open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/things-to-do" className={`navbar-link ${isActive('/things-to-do') ? 'active' : ''}`}>
              Things To Do
            </Link>
            <Link to="/hotels" className={`navbar-link ${isActive('/hotels') ? 'active' : ''}`}>
              Hotels
            </Link>
            <Link to="/restaurants" className={`navbar-link ${isActive('/restaurants') ? 'active' : ''}`}>
              Restaurants
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link
                  to={hasActivePlan ? '/planner' : '/subscription'}
                  className={`navbar-link ${isActive('/planner') || isActive('/subscription') ? 'active' : ''}`}
                >
                  <span>Plan Trip</span>
                  {!hasActivePlan && <span className="navbar-link-tag">Locked</span>}
                </Link>
                <Link to="/subscription" className={`navbar-link ${isActive('/subscription') ? 'active' : ''}`}>
                  Subscription
                </Link>
              </>
            )}
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="navbar-user">
                <button
                  type="button"
                  className="account-trigger"
                  onClick={() => setAccountOpen(open => !open)}
                  aria-expanded={accountOpen}
                >
                  <span className={`navbar-avatar ${avatarUpdating ? 'navbar-avatar-loading' : ''}`}>
                    {currentAvatar ? (
                      <img src={currentAvatar} alt={firstName} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </span>
                  <span>My Account</span>
                  <svg className="account-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="account-menu">
                    <div className="account-profile">
                      <label className={`account-avatar ${avatarUpdating ? 'navbar-avatar-loading' : ''}`} title="Change profile picture">
                        {currentAvatar ? (
                          <img src={currentAvatar} alt={firstName} />
                        ) : (
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          aria-label="Upload profile picture"
                        />
                      </label>

                      <div className="account-info">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                      </div>
                    </div>

                    <div className="account-actions">
                      <label className="account-action-btn">
                        Edit Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          aria-label="Edit profile picture"
                        />
                      </label>
                      <button
                        type="button"
                        className="account-action-btn"
                        onClick={handleRemoveAvatar}
                        disabled={!currentAvatar || avatarUpdating}
                      >
                        Remove Photo
                      </button>
                    </div>

                    <div className="account-subscription">
                      <small>Plan: <strong>{user?.plan || 'none'}</strong></small>
                      {user?.planExpiry && (
                        <small>Expires: {new Date(user.planExpiry).toLocaleDateString()}</small>
                      )}
                      <Link
                        to="/subscription"
                        className="account-action-manage"
                        onClick={() => setAccountOpen(false)}
                      >
                        Manage Subscription
                      </Link>
                    </div>

                    <button type="button" className="account-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-buttons">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileOpen ? 'hamburger-open' : ''}`}></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
