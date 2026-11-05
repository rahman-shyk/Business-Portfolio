import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { formatPrice } from '../utils/formatPrice'
import NotFound from './NotFound'
import ProductRating from '../components/product/ProductRating'

export default function ProductDetails() {
  const { slug } = useParams()
  const { products, loading, error } = useProducts()
  const product = products.find((item) => item.slug === slug)
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)

  if (loading) return <section className="section container"><p role="status">Loading this article…</p></section>
  if (error) return <section className="section container"><p role="alert">Could not load this article: {error}</p></section>
  if (!product) return <NotFound />

  const addProduct = () => {
    addToCart(product, quantity)
    navigate(ROUTES.cart)
  }

  return (
    <section className="product-detail container">
      <div className={`detail-art product-art--${product.color}`}>
        {product.image_url && <img className="detail-photo" src={product.image_url} alt={product.name} />}
        <span className="fabric-motif" aria-hidden="true" />
        <span className="art-caption">{product.category} / RAHMAN FABRICS</span>
      </div>
      <div className="detail-copy">
        <p className="eyebrow"><Link to={ROUTES.shop}>Collection</Link> / {product.brand}</p>
        <h1>{product.name}</h1>
        <p className="detail-article-number">Article No. {product.articleNo}</p>
        <ProductRating rating={product.rating ?? 4} />
        <p className="detail-price">{formatPrice(product.price)} {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</p>
        <p className="detail-description">{product.description}</p>
        <div className="detail-meta"><span>Brand</span><strong>{product.brand}</strong></div>
        <div className="detail-meta"><span>Fabric</span><strong>{product.fabric}</strong></div>
        <div className="detail-meta"><span>Set</span><strong>{product.pieces}</strong></div>
        <div className="detail-meta"><span>Season</span><strong>{product.season}</strong></div>
        <div className="detail-meta"><span>Availability</span><strong>{product.stock === 0 ? 'Sold out' : `${product.stock ?? 'In stock'} available`}</strong></div>
        <div className="purchase-row">
          <label className="quantity-control">
            <span className="sr-only">Quantity</span>
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
          </label>
          <button className="button button-dark" type="button" onClick={addProduct} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Sold out' : `Add to bag — ${formatPrice(product.price * quantity)}`}
          </button>
        </div>
        <Link className="text-link" to={ROUTES.shop}>Back to the collection <span>↗</span></Link>
      </div>
    </section>
  )
}