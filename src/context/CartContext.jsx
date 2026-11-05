import { useMemo, useState } from 'react'
import { CartContext } from './cart-context'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, quantity = 1) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id)
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...currentItems, { product, quantity }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setCartItems((currentItems) =>
      quantity < 1
        ? currentItems.filter((item) => item.product.id !== productId)
        : currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    )
  }

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart: () => setCartItems([]),
      itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      subtotal: cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    }),
    [cartItems],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}