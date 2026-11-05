import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useCart } from '../hooks/useCart'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { createOrder } from '../services/orderService'
import { formatPrice } from '../utils/formatPrice'

export default function Checkout() {
  const { cartItems, subtotal, updateQuantity, clearCart } = useCart()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const submitOrder = async (event) => {
    event.preventDefault()
    setCheckoutError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      const createdOrderNumber = await createOrder({
        customer: {
          name: `${formData.get('firstName')} ${formData.get('lastName')}`,
          email: formData.get('email'),
          address: formData.get('address'),
          city: formData.get('city'),
          phone: formData.get('phone'),
        },
        items: cartItems,
      })
      setOrderNumber(createdOrderNumber)
      setOrderPlaced(true)
      clearCart()
    } catch (error) {
      setCheckoutError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <section className="section container checkout-message">
        <p className="eyebrow">THANK YOU</p>
        <h1>Your order is <em>reserved.</em></h1>
        <p>Your order <strong>RF-{String(orderNumber).padStart(6, '0')}</strong> has been placed with cash on delivery. We’ll contact you to confirm delivery details. For online payment, please contact us on WhatsApp to arrange payment.</p>
        <Link className="button button-dark" to={ROUTES.shop}>Keep exploring <span>↗</span></Link>
      </section>
    )
  }

  if (cartItems.length === 0) {
    return (
      <section className="section container checkout-message">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Your bag is empty.</h1>
        <Link className="button button-dark" to={ROUTES.shop}>Explore the collection <span>↗</span></Link>
      </section>
    )
  }

  return (
    <section className="section container checkout-page">
      <div>
        <p className="eyebrow">ALMOST YOURS</p>
        <h1>Checkout</h1>
        <form className="checkout-form" onSubmit={submitOrder}>
          <h2>Contact</h2>
          <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
          <h2>Delivery details</h2>
          <div className="form-grid">
            <label>First name<input name="firstName" autoComplete="given-name" required /></label>
            <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
          </div>
          <label>Address<input name="address" autoComplete="street-address" required /></label>
          <div className="form-grid">
            <label>City<input name="city" autoComplete="address-level2" required /></label>
            <label>Phone<input type="tel" name="phone" autoComplete="tel" required /></label>
          </div>
          <h2>Payment</h2>
          <p className="checkout-disclaimer">This checkout places Cash on Delivery orders. Online payment is also available by contacting us on WhatsApp to arrange payment. Delivery is Rs. 500 and may be negotiated according to your location; timing depends on rider availability.</p>
          {checkoutError && <p className="admin-error" role="alert">{checkoutError}</p>}
          {!isSupabaseConfigured && <p className="admin-error" role="alert">Connect Supabase to place orders from this checkout.</p>}
          <button className="button button-dark button-wide" type="submit" disabled={submitting || !isSupabaseConfigured}>
            {submitting ? 'Placing order…' : `Place order — ${formatPrice(subtotal)}`}
          </button>
        </form>
      </div>
      <aside className="checkout-order">
        <p className="eyebrow">IN YOUR BAG</p>
        {cartItems.map(({ product, quantity }) => (
          <div className="checkout-item" key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <div className="quantity-control">
                <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
              </div>
            </div>
            <span>{formatPrice(product.price * quantity)}</span>
          </div>
        ))}
        <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
        <Link className="text-link" to={ROUTES.cart}>Edit bag</Link>
      </aside>
    </section>
  )
}