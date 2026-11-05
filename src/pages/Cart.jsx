import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/formatPrice'

export default function Cart() {
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useCart()

  return (
    <section className="section container cart-page">
      <p className="eyebrow">YOUR SELECTION</p>
      <h1>Your bag<span className="heading-count"> ({cartItems.length})</span></h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your bag is taking a little breather.</p>
          <Link className="button button-dark" to={ROUTES.shop}>Explore the collection <span>↗</span></Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <Link className={`cart-thumbnail product-art--${product.color}`} to={`/product/${product.slug}`}>
                  <span className="fabric-motif" aria-hidden="true" />
                </Link>
                <div className="cart-item-info">
                  <p className="eyebrow">{product.category}</p>
                  <h2><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
                  <p>{formatPrice(product.price)}</p>
                  <div className="quantity-control">
                    <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <strong>{formatPrice(product.price * quantity)}</strong>
                  <button className="remove-button" type="button" onClick={() => removeFromCart(product.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <p className="eyebrow">ORDER SUMMARY</p>
            <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <p className="shipping-note">Delivery is Rs. 500 and negotiable according to your location/address. Contact us on WhatsApp to discuss the charge.</p>
            <Link className="button button-dark button-wide" to={ROUTES.checkout}>Continue to checkout <span>↗</span></Link>
            <Link className="text-link" to={ROUTES.shop}>Continue shopping</Link>
          </aside>
        </div>
      )}
    </section>
  )
}