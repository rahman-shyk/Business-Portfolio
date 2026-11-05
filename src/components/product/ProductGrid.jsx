import ProductCard from './ProductCard'

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return <p className="empty-message">No pieces match this collection just yet.</p>
  }

  return (
    <div className="product-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}