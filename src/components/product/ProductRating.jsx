export default function ProductRating({ rating = 4 }) {
  const wholeStars = Math.floor(rating)
  const hasHalfStar = rating % 1 === 0.5
  const emptyStars = 5 - wholeStars - Number(hasHalfStar)
  const stars = `${'★'.repeat(wholeStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}`

  return (
    <span className="product-rating" role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      <span aria-hidden="true">{stars}</span>
      <span className="product-rating-value">{rating.toFixed(1)}</span>
    </span>
  )
}
