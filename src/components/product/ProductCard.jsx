import { Link } from 'react-router-dom'
import { productRoute } from '../../constants/routes'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'
import ProductRating from './ProductRating'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="product-card">
      <Link
        className={`product-art product-art--${product.color}`}
        to={productRoute(product.slug)}
        aria-label={`View ${product.name}`}
      >
        {product.label && <span className="product-label">{product.label}</span>}
        {product.stock === 0 && <span className="product-label product-label-sold-out">Sold out</span>}
        {product.image_url && <img className="product-photo" src={product.image_url} alt={product.name} loading="lazy" />}
        <span className="fabric-motif" aria-hidden="true" />
        <span className="art-caption">{product.brand} / {product.articleNo}</span>
      </Link>
      <div className="product-info">
        <div>
          <p className="eyebrow product-brand">{product.brand}</p>
          <h3><Link to={productRoute(product.slug)}>{product.name}</Link></h3>
          <p className="article-info">{product.articleNo} <span>·</span> {product.pieces}</p>
          <p className="article-fabric">{product.fabric}</p>
          <ProductRating rating={product.rating ?? 4} />
          <p className="product-price">
            {formatPrice(product.price)}
            {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
          </p>
        </div>
        <button
          className="add-button"
          type="button"
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          aria-label={product.stock === 0 ? `${product.name} is sold out` : `Add ${product.name} to bag`}
        >
          {product.stock === 0 ? '−' : '+'}
        </button>
      </div>
    </article>
  )
}