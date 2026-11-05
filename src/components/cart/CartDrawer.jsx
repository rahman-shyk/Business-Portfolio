import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, subtotal, removeFromCart } = useCart()

  if (!isOpen) return null

  return (
    <div className="cart-drawer-layer">
      <button className="cart-drawer-backdrop" type="button" onClick={onClose} aria-label="Close shopping bag" />
      <section className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2 id="cart-drawer-title">Your bag <span>({cartItems.length})</span></h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose} aria-label="Close shopping bag">×</button>
        </div>
        {cartItems.length === 0 ? (
          <div className="drawer-empty">
            <p>Your bag is taking a little breather.</p>
            <Link className="text-link" to={ROUTES.shop} onClick={onClose}>Explore the collection <span>↗</span></Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cartItems.map(({ product, quantity }) => (
                <article className="drawer-item" key={product.id}>
                  <div className={`drawer-thumbnail product-art--${product.color}`}>
                    <span className="fabric-motif" aria-hidden="true" />
                  </div>
                  <div className="drawer-item-copy">
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p>{quantity} × {formatPrice(product.price)}</p>
                    <button className="remove-button" type="button" onClick={() => removeFromCart(product.id)}>Remove</button>
                  </div>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </article>
              ))}
            </div>
            <div className="drawer-footer">
              <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="shipping-note">Delivery is Rs. 500 and negotiable according to your location/address. Contact us on WhatsApp to discuss the charge.</p>
              <Link className="button button-dark button-wide" to={ROUTES.cart} onClick={onClose}>View bag and checkout <span>↗</span></Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}