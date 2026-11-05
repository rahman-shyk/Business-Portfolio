export const ROUTES = {
  home: '/',
  shop: '/shop',
  product: '/product/:slug',
  cart: '/cart',
  checkout: '/checkout',
}

export const productRoute = (slug) => `/product/${slug}`