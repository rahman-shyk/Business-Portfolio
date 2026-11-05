import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import AnnouncementBar from './components/layout/AnnouncementBar'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import { CartProvider } from './context/CartContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProductDetails from './pages/ProductDetails'
import Shop from './pages/Shop'
import { ROUTES } from './constants/routes'
import AdminDashboard from './pages/AdminDashboard'
import FloatingSupport from './components/layout/FloatingSupport'

function AppLayout() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')
  const MainElement = isAdminRoute ? 'div' : 'main'

  return (
    <CartProvider>
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <Navbar />}
      <MainElement>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.shop} element={<Shop />} />
          <Route path={ROUTES.product} element={<ProductDetails />} />
          <Route path={ROUTES.cart} element={<Cart />} />
          <Route path={ROUTES.checkout} element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainElement>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingSupport />}
    </CartProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
