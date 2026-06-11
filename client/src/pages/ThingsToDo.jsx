import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BubbleRating from '../components/UI/BubbleRating'

const categories = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'food', label: 'Food Tours', icon: '🍽️' },
  { id: 'sightseeing', label: 'Sightseeing', icon: '📸' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { id: 'water', label: 'Water Sports', icon: '🏄' },
]

const activities = [
  {
    id: 1, title: 'Eiffel Tower Skip-the-Line Tour', city: 'Paris, France',
    category: 'sightseeing',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 18420, price: '₹3,200', duration: '2 hours', tag: 'Bestseller',
  },
  {
    id: 2, title: 'Bali Rice Terraces & Volcano Trek', city: 'Ubud, Bali',
    category: 'adventure',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 9830, price: '₹2,500', duration: '6 hours', tag: 'Top Rated',
  },
  {
    id: 3, title: 'Tokyo Street Food Night Tour', city: 'Tokyo, Japan',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 12140, price: '₹4,100', duration: '3 hours', tag: 'Bestseller',
  },
  {
    id: 4, title: 'Colosseum Underground & Forum Tour', city: 'Rome, Italy',
    category: 'culture',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 22100, price: '₹3,800', duration: '3 hours', tag: null,
  },
  {
    id: 5, title: 'Amazon Rainforest River Safari', city: 'Manaus, Brazil',
    category: 'nature',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80',
    rating: 4.6, reviews: 5320, price: '₹6,500', duration: '8 hours', tag: 'Adventure',
  },
  {
    id: 6, title: 'Santorini Sunset Sailing Cruise', city: 'Santorini, Greece',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 7810, price: '₹5,200', duration: '5 hours', tag: 'Top Rated',
  },
  {
    id: 7, title: 'Dubai Desert Safari & BBQ Dinner', city: 'Dubai, UAE',
    category: 'adventure',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 31200, price: '₹4,800', duration: '6 hours', tag: 'Popular',
  },
  {
    id: 8, title: 'New York City Skyline Night Tour', city: 'New York, USA',
    category: 'nightlife',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 14500, price: '₹3,600', duration: '3 hours', tag: null,
  },
  {
    id: 9, title: 'Machu Picchu Guided Hiking Tour', city: 'Cusco, Peru',
    category: 'nature',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 8940, price: '₹7,200', duration: 'Full Day', tag: 'Bucket List',
  },
  {
    id: 10, title: 'Goa Scuba Diving & Snorkeling', city: 'Goa, India',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    rating: 4.6, reviews: 4120, price: '₹2,200', duration: '4 hours', tag: null,
  },
  {
    id: 11, title: 'Barcelona Tapas & Wine Night', city: 'Barcelona, Spain',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 6780, price: '₹3,900', duration: '3 hours', tag: 'Top Rated',
  },
  {
    id: 12, title: 'Rajasthan Desert Camel Safari', city: 'Jaisalmer, India',
    category: 'adventure',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 9200, price: '₹1,800', duration: '4 hours', tag: 'Popular',
  },
]

const topDestinations = [
  { city: 'Paris', activities: '1,240+', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { city: 'Tokyo', activities: '980+', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { city: 'New York', activities: '2,100+', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80' },
  { city: 'Bali', activities: '760+', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { city: 'Dubai', activities: '1,500+', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { city: 'Rome', activities: '890+', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
]

const ThingsToDo = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, hasActivePlan } = useAuth()

  const filtered = activities.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleBook = () => {
    if (!isAuthenticated) navigate('/signup')
    else if (!hasActivePlan) navigate('/subscription')
    else navigate('/planner')
  }

  return (
    <div className="explore-page">
      {/* Hero */}
      <section className="explore-hero things-hero">
        <div className="explore-hero-overlay" />
        <div className="explore-hero-content">
          <p className="explore-hero-kicker">Experiences & Tours</p>
          <h1 className="explore-hero-title">Things To Do</h1>
          <p className="explore-hero-sub">Discover the world's most incredible experiences, tours & adventures</p>
          <div className="explore-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search activities, cities, experiences..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="explore-search-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="explore-categories-section">
        <div className="container">
          <div className="explore-categories-scroll">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`explore-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="explore-grid-section">
        <div className="container">
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">
                {activeCategory === 'all' ? 'All Experiences' : categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p className="explore-section-sub">{filtered.length} experiences found</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="explore-empty">
              <span>🔍</span>
              <p>No experiences found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="explore-cards-grid">
              {filtered.map(activity => (
                <article key={activity.id} className="explore-card" onClick={handleBook}>
                  <div className="explore-card-img">
                    <img src={activity.image} alt={activity.title} loading="lazy" />
                    {activity.tag && <span className="explore-card-tag">{activity.tag}</span>}
                    <div className="explore-card-overlay">
                      <button className="explore-card-cta">Book Now</button>
                    </div>
                  </div>
                  <div className="explore-card-body">
                    <span className="explore-card-location">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {activity.city}
                    </span>
                    <h3 className="explore-card-title">{activity.title}</h3>
                    <div className="explore-card-rating">
                      <BubbleRating rating={activity.rating} count={activity.reviews} />
                    </div>
                    <div className="explore-card-footer">
                      <div>
                        <span className="explore-card-duration">⏱ {activity.duration}</span>
                      </div>
                      <span className="explore-card-price">From {activity.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Destinations */}
      <section className="explore-destinations-section">
        <div className="container">
          <h2 className="explore-section-title">Top Destinations for Activities</h2>
          <p className="explore-section-sub">Browse experiences by destination</p>
          <div className="explore-dest-grid">
            {topDestinations.map(dest => (
              <div key={dest.city} className="explore-dest-card" onClick={() => setSearch(dest.city)}>
                <img src={dest.image} alt={dest.city} loading="lazy" />
                <div className="explore-dest-info">
                  <h3>{dest.city}</h3>
                  <span>{dest.activities} activities</span>
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
              <h2>Ready to plan your adventure?</h2>
              <p>Use our AI trip planner to build the perfect itinerary with activities included</p>
            </div>
            <button className="explore-cta-btn" onClick={handleBook}>
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

export default ThingsToDo
