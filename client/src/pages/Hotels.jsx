import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BubbleRating from '../components/UI/BubbleRating'

const starFilters = [
  { id: 'all', label: 'All Stars' },
  { id: 5, label: '5 Stars' },
  { id: 4, label: '4 Stars' },
  { id: 3, label: '3 Stars' },
]

const priceFilters = [
  { id: 'all', label: 'Any Price' },
  { id: 'budget', label: 'Budget (< ₹5,000/night)' },
  { id: 'mid', label: 'Mid-Range (₹5,000–₹15,000)' },
  { id: 'luxury', label: 'Luxury (> ₹15,000)' },
]

const hotels = [
  {
    id: 1, name: 'The Ritz Paris', city: 'Paris, France', stars: 5,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 8420, price: 32000, priceLabel: '₹32,000', amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi'],
    tag: 'Luxury Pick', address: '15 Place Vendôme, Paris',
  },
  {
    id: 2, name: 'Park Hyatt Tokyo', city: 'Tokyo, Japan', stars: 5,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 6130, price: 28000, priceLabel: '₹28,000', amenities: ['Pool', 'Gym', 'Restaurant', 'WiFi'],
    tag: 'Top Rated', address: '3-7-1-2 Nishi Shinjuku, Tokyo',
  },
  {
    id: 3, name: 'Four Seasons Bali at Sayan', city: 'Ubud, Bali', stars: 5,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    rating: 4.9, reviews: 4210, price: 25000, priceLabel: '₹25,000', amenities: ['Pool', 'Spa', 'WiFi', 'Beach'],
    tag: 'Best Value', address: 'Sayan, Ubud, Bali',
  },
  {
    id: 4, name: 'The Taj Mahal Palace', city: 'Mumbai, India', stars: 5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    rating: 4.7, reviews: 12800, price: 18000, priceLabel: '₹18,000', amenities: ['Pool', 'Spa', 'Restaurant', 'Bar'],
    tag: 'Heritage', address: 'Apollo Bunder, Mumbai',
  },
  {
    id: 5, name: 'Burj Al Arab Jumeirah', city: 'Dubai, UAE', stars: 5,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8, reviews: 9340, price: 65000, priceLabel: '₹65,000', amenities: ['Pool', 'Spa', 'Helipad', 'Private Beach'],
    tag: 'Iconic', address: 'Jumeirah St, Dubai',
  },
  {
    id: 6, name: 'Hotel Hassler Roma', city: 'Rome, Italy', stars: 5,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    rating: 4.6, reviews: 3800, price: 22000, priceLabel: '₹22,000', amenities: ['Restaurant', 'Bar', 'WiFi', 'Concierge'],
    tag: null, address: 'Piazza della Trinità dei Monti 6, Rome',
  },
  {
    id: 7, name: 'Fabhotel Prime Sunway', city: 'Goa, India', stars: 3,
    image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=600&q=80',
    rating: 4.2, reviews: 2100, price: 3500, priceLabel: '₹3,500', amenities: ['Pool', 'WiFi', 'Breakfast'],
    tag: 'Budget Friendly', address: 'Calangute, North Goa',
  },
  {
    id: 8, name: 'Novotel Singapore', city: 'Singapore', stars: 4,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80',
    rating: 4.5, reviews: 7620, price: 9000, priceLabel: '₹9,000', amenities: ['Pool', 'Gym', 'WiFi', 'Restaurant'],
    tag: null, address: '10 Claymore Road, Singapore',
  },
  {
    id: 9, name: 'Zostel Jaisalmer', city: 'Jaisalmer, India', stars: 3,
    image: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?auto=format&fit=crop&w=600&q=80',
    rating: 4.3, reviews: 1890, price: 2200, priceLabel: '₹2,200', amenities: ['WiFi', 'Rooftop', 'Breakfast'],
    tag: 'Backpacker Fav', address: 'Manak Chowk, Jaisalmer',
  },
]

const popularDestinations = [
  { city: 'Maldives', hotels: '340+', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=400&q=80' },
  { city: 'Paris', hotels: '1,200+', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { city: 'Bali', hotels: '890+', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { city: 'Dubai', hotels: '600+', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { city: 'New York', hotels: '2,400+', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80' },
  { city: 'Goa', hotels: '780+', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80' },
]

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const Hotels = () => {
  const [starFilter, setStarFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, hasActivePlan } = useAuth()

  const filtered = hotels.filter(h => {
    const matchStar = starFilter === 'all' || h.stars === starFilter
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
    const matchPrice = priceFilter === 'all' ||
      (priceFilter === 'budget' && h.price < 5000) ||
      (priceFilter === 'mid' && h.price >= 5000 && h.price <= 15000) ||
      (priceFilter === 'luxury' && h.price > 15000)
    return matchStar && matchSearch && matchPrice
  })

  const handleBook = (hotel) => {
    window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name)}`, '_blank')
  }

  const handlePlanTrip = () => {
    if (!isAuthenticated) navigate('/signup')
    else if (!hasActivePlan) navigate('/subscription')
    else navigate('/planner')
  }

  return (
    <div className="explore-page">
      {/* Hero */}
      <section className="explore-hero hotels-hero">
        <div className="explore-hero-overlay" />
        <div className="explore-hero-content">
          <p className="explore-hero-kicker">Find Your Perfect Stay</p>
          <h1 className="explore-hero-title">Hotels & Stays</h1>
          <p className="explore-hero-sub">From luxury resorts to budget-friendly hostels — find the perfect stay for your trip</p>
          <div className="explore-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search hotels, cities, destinations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="explore-search-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="explore-categories-section">
        <div className="container">
          <div className="hotels-filters-row">
            <div className="hotels-filter-group">
              <span className="filter-label">Star Rating</span>
              <div className="explore-categories-scroll">
                {starFilters.map(f => (
                  <button
                    key={f.id}
                    className={`explore-cat-pill ${starFilter === f.id ? 'active' : ''}`}
                    onClick={() => setStarFilter(f.id)}
                  >
                    {f.id !== 'all' && <StarIcon filled />}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hotels-filter-group">
              <span className="filter-label">Price Range</span>
              <div className="explore-categories-scroll">
                {priceFilters.map(f => (
                  <button
                    key={f.id}
                    className={`explore-cat-pill ${priceFilter === f.id ? 'active' : ''}`}
                    onClick={() => setPriceFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="explore-grid-section">
        <div className="container">
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">Available Hotels</h2>
              <p className="explore-section-sub">{filtered.length} hotels found</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="explore-empty">
              <span>🏨</span>
              <p>No hotels found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="explore-cards-grid hotels-grid">
              {filtered.map(hotel => (
                <article key={hotel.id} className="explore-card hotel-card">
                  <div className="explore-card-img">
                    <img src={hotel.image} alt={hotel.name} loading="lazy" />
                    {hotel.tag && <span className="explore-card-tag">{hotel.tag}</span>}
                    <div className="hotel-stars-badge">
                      {Array.from({ length: hotel.stars }).map((_, i) => <StarIcon key={i} filled />)}
                    </div>
                    <div className="explore-card-overlay">
                      <button className="explore-card-cta" onClick={() => handleBook(hotel)}>View Deal</button>
                    </div>
                  </div>
                  <div className="explore-card-body">
                    <span className="explore-card-location">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {hotel.address}
                    </span>
                    <h3 className="explore-card-title">{hotel.name}</h3>
                    <div className="explore-card-rating">
                      <BubbleRating rating={hotel.rating} count={hotel.reviews} />
                    </div>
                    <div className="hotel-amenities">
                      {hotel.amenities.slice(0, 3).map(a => (
                        <span key={a} className="hotel-amenity-tag">{a}</span>
                      ))}
                    </div>
                    <div className="explore-card-footer">
                      <div className="hotel-price-block">
                        <span className="hotel-price">{hotel.priceLabel}</span>
                        <span className="hotel-per-night">/ night</span>
                      </div>
                      <button
                        className="hotel-book-btn"
                        onClick={() => handleBook(hotel)}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="explore-destinations-section">
        <div className="container">
          <h2 className="explore-section-title">Popular Hotel Destinations</h2>
          <p className="explore-section-sub">Thousands of hotels in top travel cities</p>
          <div className="explore-dest-grid">
            {popularDestinations.map(dest => (
              <div key={dest.city} className="explore-dest-card" onClick={() => setSearch(dest.city)}>
                <img src={dest.image} alt={dest.city} loading="lazy" />
                <div className="explore-dest-info">
                  <h3>{dest.city}</h3>
                  <span>{dest.hotels} hotels</span>
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
              <h2>Let AI pick the best hotel for you</h2>
              <p>Plan a complete trip with hotels auto-selected based on your budget and travel style</p>
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

export default Hotels
