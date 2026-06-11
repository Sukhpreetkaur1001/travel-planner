import BubbleRating from '../UI/BubbleRating'

const HotelCard = ({ hotel, onSelect, selected }) => {
  const simulatedReviewsCount = Math.floor((Number(hotel.rating) || 4.2) * 230) + 12

  return (
    <div className={`hotel-card ${selected ? 'hotel-card-selected' : ''}`} onClick={() => onSelect && onSelect(hotel)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
      <div className="hotel-image">
        <img 
          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} 
          alt={hotel.name}
          loading="lazy"
        />
      </div>
      
      <div className="hotel-content">
        <h3 className="hotel-name">{hotel.name}</h3>
        
        <div style={{ marginTop: '4px', marginBottom: '8px' }}>
          <BubbleRating rating={hotel.rating} count={simulatedReviewsCount} />
        </div>

        <p className="hotel-address">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {hotel.address}
        </p>
        
        <div className="hotel-price">
          <span className="hotel-price-amount">${hotel.price}</span>
          <span className="hotel-price-period">/night</span>
        </div>
      </div>

      {selected && (
        <div className="hotel-selected-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </div>
  )
}

export default HotelCard