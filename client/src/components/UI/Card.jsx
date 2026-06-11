const Card = ({ 
  children, 
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  onClick,
  ...props 
}) => {
  const cardClass = `
    card 
    card-${variant} 
    card-padding-${padding}
    ${hoverable ? 'card-hoverable' : ''}
    ${onClick ? 'card-clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export default Card