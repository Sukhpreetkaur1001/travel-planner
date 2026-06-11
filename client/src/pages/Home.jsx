import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import BubbleRating from '../components/UI/BubbleRating'
import heroImage from '../assets/hero.png'

const Home = () => {
  const { isAuthenticated, hasActivePlan } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchData, setSearchData] = useState({ destination: '', checkIn: '', checkOut: '', travelers: 1 })

  const [featuredTrips] = useState([
    { id: 1, destination: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', rating: 4.8, reviews: 12450, price: 'From $1,200' },
    { id: 2, destination: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80', rating: 4.9, reviews: 8190, price: 'From $1,800' },
    { id: 3, destination: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80', rating: 4.7, reviews: 15120, price: 'From $900' },
    { id: 4, destination: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=900&q=80', rating: 4.6, reviews: 24210, price: 'From $1,500' }
  ])

  const trendingDestinations = [
    { id: 1, city: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=600&q=80', trend: '🔥 Hot' },
    { id: 2, city: 'Maldives', country: 'Indian Ocean', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=600&q=80', trend: '⭐ Top Pick' },
    { id: 3, city: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80', trend: '🌸 Seasonal' },
    { id: 4, city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', trend: '🏆 Popular' },
    { id: 5, city: 'Machu Picchu', country: 'Peru', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80', trend: '🗺 Adventure' },
    { id: 6, city: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80', trend: '🏛️ Culture' },
  ]

  const categories = [
    {
      id: 'all',
      label: 'Search All',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      placeholder: 'Where do you want to go?',
      link: null,
    },
    {
      id: 'hotels',
      label: 'Hotels',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
        </svg>
      ),
      placeholder: 'Search hotels, B&Bs, resorts...',
      link: '/hotels',
    },
    {
      id: 'activities',
      label: 'Things to Do',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      placeholder: 'Things to do, tours, sights...',
      link: '/things-to-do',
    },
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2v14M18 2v14M12 2v20M8 22h8"/>
        </svg>
      ),
      placeholder: 'Search restaurants, local eats...',
      link: '/restaurants',
    }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    const activeCat = categories.find(cat => cat.id === activeTab)
    if (activeCat?.link) {
      navigate(activeCat.link)
    } else if (searchData.destination) {
      navigate('/planner', { state: { destination: searchData.destination } })
    }
  }

  const handleTabClick = (cat) => {
    setActiveTab(cat.id)
    if (cat.link) {
      navigate(cat.link)
    }
  }

  const activeCategory = categories.find(cat => cat.id === activeTab) || categories[0]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="hero-background">
          <img
            src={heroImage}
            alt="Travel"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', zIndex: 10 }}>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            Where to?
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '40px', color: '#ffffff', opacity: 0.9 }}>
            Plan personalized trips with AI-powered itineraries tailored just for you
          </p>

          {/* Search Box */}
          <div className="tripadvisor-search-container">
            <nav className="tripadvisor-categories-nav">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(cat)}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </nav>

            <form className="tripadvisor-search-form" onSubmit={handleSearch}>
              <div className="search-field" style={{ flex: 1.8 }}>
                <div className="search-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={activeCategory.placeholder}
                  value={searchData.destination}
                  onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                />
              </div>

              <div className="search-field-divider"></div>

              <div className="search-field" style={{ flex: 1.2 }}>
                <div className="search-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                />
              </div>

              <div className="search-field-divider"></div>

              <div className="search-field" style={{ flex: 1 }}>
                <div className="search-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <select
                  value={searchData.travelers}
                  onChange={(e) => setSearchData({ ...searchData, travelers: Number(e.target.value) })}
                  aria-label="Travelers count"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="tripadvisor-search-btn">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="hero-stats" style={{ marginTop: 'auto', zIndex: 10 }}>
          <div className="stat-item">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Happy Travelers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">120+</span>
            <span className="stat-label">Destinations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <span className="stat-label">User Rating</span>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="home-browse-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Discover hotels, activities and restaurants around the world</p>
          <div className="home-browse-grid">
            <Link to="/things-to-do" className="home-browse-card things-card">
              <div className="home-browse-img">
                <img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=700&q=80" alt="Things to Do" />
                <div className="home-browse-overlay" />
              </div>
              <div className="home-browse-content">
                <div className="home-browse-icon">🎯</div>
                <h3>Things To Do</h3>
                <p>Tours, adventures & experiences</p>
                <span className="home-browse-cta">Explore →</span>
              </div>
            </Link>

            <Link to="/hotels" className="home-browse-card hotels-card">
              <div className="home-browse-img">
                <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=700&q=80" alt="Hotels" />
                <div className="home-browse-overlay" />
              </div>
              <div className="home-browse-content">
                <div className="home-browse-icon">🏨</div>
                <h3>Hotels</h3>
                <p>Luxury resorts to cozy stays</p>
                <span className="home-browse-cta">Browse Hotels →</span>
              </div>
            </Link>

            <Link to="/restaurants" className="home-browse-card restaurants-card">
              <div className="home-browse-img">
                <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80" alt="Restaurants" />
                <div className="home-browse-overlay" />
              </div>
              <div className="home-browse-content">
                <div className="home-browse-icon">🍽️</div>
                <h3>Restaurants</h3>
                <p>From street food to fine dining</p>
                <span className="home-browse-cta">Find Food →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="home-trending-section">
        <div className="container">
          <div className="trending-header">
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Destinations travelers are loving right now</p>
            </div>
            <Link to={isAuthenticated && hasActivePlan ? '/planner' : '/signup'} className="trending-see-all">
              See All →
            </Link>
          </div>
          <div className="trending-grid">
            {trendingDestinations.map(dest => (
              <Link
                key={dest.id}
                to={isAuthenticated && hasActivePlan ? '/planner' : (isAuthenticated ? '/subscription' : '/signup')}
                className="trending-card"
              >
                <div className="trending-card-img">
                  <img src={dest.image} alt={dest.city} loading="lazy" />
                  <span className="trending-badge">{dest.trend}</span>
                </div>
                <div className="trending-card-info">
                  <h3>{dest.city}</h3>
                  <span>{dest.country}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Wanderlust?</h2>
          <p className="section-subtitle">Everything you need for the perfect trip</p>

          <div className="features-grid">
            <Card className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Itineraries</h3>
              <p className="feature-description">Get personalized day-by-day plans tailored to your preferences and budget</p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <h3 className="feature-title">Smart Budgeting</h3>
              <p className="feature-description">Stay within your budget with detailed cost breakdowns and recommendations</p>
            </Card>

            <Card className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="feature-title">Curated Hotels</h3>
              <p className="feature-description">Hand-picked accommodations with verified reviews and competitive prices</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="destinations">
        <div className="container">
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">Explore trending locations loved by travelers</p>

          <div className="destinations-grid">
            {featuredTrips.map((trip) => (
              <Link key={trip.id} to={isAuthenticated && hasActivePlan ? '/planner' : (isAuthenticated ? '/subscription' : '/signup')} className="destination-card">
                <div className="destination-image">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = heroImage
                    }}
                  />
                </div>
                <div className="destination-content">
                  <h3 className="destination-name">{trip.destination}</h3>
                  <span className="destination-country">{trip.country}</span>
                  <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <BubbleRating rating={trip.rating} count={trip.reviews} />
                  </div>
                  <span className="destination-price" style={{ fontWeight: 700, color: 'black' }}>{trip.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">Join thousands of travelers who plan their perfect trips with us</p>
            <div className="cta-buttons">
              <Link to={isAuthenticated ? (hasActivePlan ? '/planner' : '/subscription') : '/signup'}>
                <Button variant="primary" size="lg">
                  {isAuthenticated ? (hasActivePlan ? 'Plan a Trip' : 'Upgrade to Subscribe') : 'Get Started Free'}
                </Button>
              </Link>
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                <Button variant="outline" size="lg">
                  {isAuthenticated ? 'View Dashboard' : 'Sign In'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
