import React from 'react'

const BubbleRating = ({ rating, count, className = '' }) => {
  const bubbles = []
  const numericRating = Number(rating) || 0
  
  for (let i = 1; i <= 5; i++) {
    if (numericRating >= i) {
      bubbles.push(<span key={i} className="rating-bubble bubble-full"></span>)
    } else if (numericRating >= i - 0.5) {
      bubbles.push(<span key={i} className="rating-bubble bubble-half"></span>)
    } else {
      bubbles.push(<span key={i} className="rating-bubble bubble-empty"></span>)
    }
  }

  return (
    <div className={`bubble-rating-container ${className}`}>
      <div className="bubbles-wrapper">
        {bubbles}
      </div>
      {count !== undefined && count !== null && (
        <span className="bubble-rating-count">{Number(count).toLocaleString()} reviews</span>
      )}
    </div>
  )
}

export default BubbleRating
