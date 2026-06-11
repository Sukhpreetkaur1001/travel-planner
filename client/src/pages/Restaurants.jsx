import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BubbleRating from '../components/UI/BubbleRating'

const cuisines = [
  { id: 'all', label: 'All Cuisines', icon: '🍴' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'italian', label: 'Italian', icon: '🍕' },
  { id: 'japanese', label: 'Japanese', icon: '🍣' },
  { id: 'chinese', label: 'Chinese', icon: '🥢' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'continental', label: 'Continental', icon: '🥗' },
  { id: 'street', label: 'Street Food', icon: '🌯' },
  { id: 'seafood', label: 'Seafood', icon: '🦞' },
]

const restaurants = [
  {
    id: 1, name: 'Indian Accent', city: 'New Delhi, India', cuisine: 'indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 14200, priceRange: '₹₹₹₹', isOpen: true,
    tag: 'Michelin Star', specialty: 'Modern Indian Cuisine',
  },
  {
    id: 2, name: 'Osteria Francescana', city: 'Modena, Italy', cuisine: 'italian',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    rating: 5.0, reviews: 6800, priceRange: '₹₹₹₹', isOpen: true,
    tag: "#1 World's Best", specialty: 'Fine Italian Dining',
  },
  {
    id: 3, name: 'Narisawa', city: 'Tokyo, Japan', cuisine: 'japanese',
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 5200, priceRange: '₹₹₹₹', isOpen: false,
    tag: 'Iconic', specialty: 'Innovative Japanese',
  },
  {
    id: 4, name: 'Din Tai Fung', city: 'Taipei, Taiwan', cuisine: 'chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 31000, priceRange: '₹₹₹', isOpen: true,
    tag: 'Bestseller', specialty: 'Dim Sum & Dumplings',
  },
  {
    id: 5, name: 'Pujol', city: 'Mexico City, Mexico', cuisine: 'mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 8900, priceRange: '₹₹₹₹', isOpen: true,
    tag: 'Top 50 World', specialty: 'Modern Mexican',
  },
  {
    id: 6, name: "Gordon Ramsay's Petrus", city: 'London, UK', cuisine: 'continental',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 12300, priceRange: '₹₹₹₹', isOpen: true,
    tag: 'Celebrity Chef', specialty: 'French Continental',
  },
  {
    id: 7, name: 'Bukhara - ITC Maurya', city: 'New Delhi, India', cuisine: 'indian',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 22400, priceRange: '₹₹₹', isOpen: true,
    tag: "World's 50 Best", specialty: 'North Indian & Dal Makhani',
  },
  {
    id: 8, name: 'Vada Pav Junction', city: 'Mumbai, India', cuisine: 'street',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    rating: 4.6, reviews: 8100, priceRange: '₹', isOpen: true,
    tag: 'Local Legend', specialty: 'Mumbai Street Food',
  },
  {
    id: 9, name: 'Nobu Malibu', city: 'Malibu, USA', cuisine: 'japanese',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 9400, priceRange: '₹₹₹₹', isOpen: true,
    tag: 'Celebrity Fav', specialty: 'Japanese-Peruvian Fusion',
  },
  {
    id: 10, name: 'Trishna', city: 'Mumbai, India', cuisine: 'seafood',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 18700, priceRange: '₹₹₹', isOpen: true,
    tag: 'Seafood Icon', specialty: 'Butter Garlic Crab',
  },
  {
    id: 11, name: 'Le Bernardin', city: 'New York, USA', cuisine: 'seafood',
    image: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 7200, priceRange: '₹₹₹₹', isOpen: false,
    tag: '3 Michelin Stars', specialty: 'French Seafood',
  },
  {
    id: 12, name: 'Katz\'s Delicatessen', city: 'New York, USA', cuisine: 'street',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    rating: 4.5, reviews: 42000, priceRange: '₹₹', isOpen: true,
    tag: 'NYC Institution', specialty: 'Pastrami Sandwiches',
  },
]

const topCities = [
  { city: 'Mumbai', restaurants: '14,800+', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
  { city: 'Paris', restaurants: '18,200+', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { city: 'Tokyo', restaurants: '28,000+', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { city: 'New York', restaurants: '22,400+', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80' },
  { city: 'Barcelona', restaurants: '12,100+', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80' },
  { city: 'Bangkok', restaurants: '16,500+', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80' },
]

const Restaurants = () => {
  const [activeCuisine, setActiveCuisine] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, hasActivePlan } = useAuth()

  const filtered = restaurants.filter(r => {
    const matchCuisine = activeCuisine === 'all' || r.cuisine === activeCuisine
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      r.specialty.toLowerCase().includes(search.toLowerCase())
    return matchCuisine && matchSearch
  })

  const handleBook = (restaurant) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(restaurant.name + ' ' + restaurant.city + ' reservation')}`, '_blank')
  }

  const handlePlanTrip = () => {
    if (!isAuthenticated) navigate('/signup')
    else if (!hasActivePlan) navigate('/subscription')
    else navigate('/planner')
  }

  return (
    <div className="explore-page">
      {/* Hero */}
      <section className="explore-hero restaurants-hero">
        <div className="explore-hero-overlay" />
        <div className="explore-hero-content">
          <p className="explore-hero-kicker">Discover Great Food</p>
          <h1 className="explore-hero-title">Restaurants</h1>
          <p className="explore-hero-sub">Find the world's best restaurants — from street food stalls to Michelin-starred fine dining</p>
          <div className="explore-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search restaurants, cuisines, cities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="explore-search-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Cuisine Filters */}
      <section className="explore-categories-section">
        <div className="container">
          <div className="explore-categories-scroll">
            {cuisines.map(c => (
              <button
                key={c.id}
                className={`explore-cat-pill ${activeCuisine === c.id ? 'active' : ''}`}
                onClick={() => setActiveCuisine(c.id)}
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="explore-grid-section">
        <div className="container">
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">
                {activeCuisine === 'all' ? 'All Restaurants' : `${cuisines.find(c => c.id === activeCuisine)?.label} Restaurants`}
              </h2>
              <p className="explore-section-sub">{filtered.length} restaurants found</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="explore-empty">
              <span>🍽️</span>
              <p>No restaurants found. Try a different cuisine or search term.</p>
            </div>
          ) : (
            <div className="explore-cards-grid">
              {filtered.map(restaurant => (
                <article key={restaurant.id} className="explore-card" onClick={() => handleBook(restaurant)}>
                  <div className="explore-card-img">
                    <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
                    {restaurant.tag && <span className="explore-card-tag">{restaurant.tag}</span>}
                    <span className={`restaurant-status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
                      {restaurant.isOpen ? '● Open Now' : '● Closed'}
                    </span>
                    <div className="explore-card-overlay">
                      <button className="explore-card-cta">Reserve Table</button>
                    </div>
                  </div>
                  <div className="explore-card-body">
                    <span className="explore-card-location">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {restaurant.city}
                    </span>
                    <h3 className="explore-card-title">{restaurant.name}</h3>
                    <p className="restaurant-specialty">{restaurant.specialty}</p>
                    <div className="explore-card-rating">
                      <BubbleRating rating={restaurant.rating} count={restaurant.reviews} />
                    </div>
                    <div className="explore-card-footer">
                      <span className="restaurant-cuisine-tag">
                        {cuisines.find(c => c.id === restaurant.cuisine)?.icon} {cuisines.find(c => c.id === restaurant.cuisine)?.label}
                      </span>
                      <span className="restaurant-price-range">{restaurant.priceRange}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Cities */}
      <section className="explore-destinations-section">
        <div className="container">
          <h2 className="explore-section-title">Best Food Cities</h2>
          <p className="explore-section-sub">Explore the world's greatest culinary destinations</p>
          <div className="explore-dest-grid">
            {topCities.map(dest => (
              <div key={dest.city} className="explore-dest-card" onClick={() => setSearch(dest.city)}>
                <img src={dest.image} alt={dest.city} loading="lazy" />
                <div className="explore-dest-info">
                  <h3>{dest.city}</h3>
                  <span>{dest.restaurants} restaurants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="explore-cta-section">
        <div className="container">
          <div className="explore-cta-box">
            <div>
              <h2>Discover food on your next trip</h2>
              <p>Our AI trip planner includes the best local restaurants in your itinerary</p>
            </div>
            <button className="explore-cta-btn" onClick={handlePlanTrip}>
              Plan My Trip
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Restaurants
