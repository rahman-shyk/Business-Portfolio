import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link className="footer-brand" to={ROUTES.home}>RAHMAN FABRICS</Link>
          <p>Thoughtful fabrics for the moments that make you.</p>
        </div>
        <div className="footer-links">
          <Link to={ROUTES.shop}>Shop collection</Link>
          <Link to={ROUTES.cart}>Your bag</Link>
          <a href="mailto:rahmanshyk@gmail.com">rahmanshyk@gmail.com</a>
        </div>
        <div className="footer-policies">
          <p>Delivery: Rs. 500, negotiable according to your location/address. Contact us on WhatsApp to discuss charges.</p>
          <p>Delivery timing depends on rider availability. Payment: Online payment or Cash on Delivery.</p>
          <p>No returns. Exchanges are available only on specific eligible items.</p>
        </div>
        <small>© {new Date().getFullYear()} Rahman Fabrics</small>
      </div>
    </footer>
  )
}