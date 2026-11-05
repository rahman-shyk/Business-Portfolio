import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CartDrawer from '../cart/CartDrawer'
import { ROUTES } from '../../constants/routes'
import { useCart } from '../../hooks/useCart'

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5" /></>,
    heart: <path d="M20.8 8.8c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></>,
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

export default function Navbar() {
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePopover, setActivePopover] = useState(null)
  const menuButtonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    menuRef.current?.querySelector('a')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      menuButton?.focus()
    }
  }, [isMenuOpen])

  const togglePopover = (name) => {
    setActivePopover((active) => active === name ? null : name)
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner container">
          <div className="header-actions header-actions-left">
            <button
              className="icon-button menu-toggle"
              type="button"
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-icon" aria-hidden="true"><span /><span /></span>
            </button>
            <Link className="icon-button" to={ROUTES.shop} aria-label="Browse and search fabrics">
              <Icon name="search" />
            </Link>
            <div className="header-popover-wrap">
              <button
                className="icon-button"
                type="button"
                onClick={() => togglePopover('account')}
                aria-label="Account"
                aria-expanded={activePopover === 'account'}
              >
                <Icon name="account" />
              </button>
              {activePopover === 'account' && (
                <div className="header-popover">
                  <strong>Your account</strong>
                  <p>Account access is coming soon.</p>
                </div>
              )}
            </div>
          </div>

          <Link className="wordmark" to={ROUTES.home} aria-label="Rahman Fabrics home">
            <span className="wordmark-mark">R</span>
            <span className="wordmark-name">
              <strong>RAHMAN</strong>
              <small>FABRICS</small>
            </span>
          </Link>

          <div className="header-actions header-actions-right">
            <div className="header-popover-wrap">
              <button
                className="icon-button"
                type="button"
                onClick={() => togglePopover('wishlist')}
                aria-label="Wishlist"
                aria-expanded={activePopover === 'wishlist'}
              >
                <Icon name="heart" />
              </button>
              {activePopover === 'wishlist' && (
                <div className="header-popover">
                  <strong>Saved pieces</strong>
                  <p>Wishlist features are coming soon.</p>
                </div>
              )}
            </div>
            <button
              className="icon-button bag-button"
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping bag, ${itemCount} items`}
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
            >
              <Icon name="bag" />
              <span className="bag-count">{itemCount}</span>
            </button>
            <a className="icon-button" href="mailto:rahmanshyk@gmail.com" aria-label="Contact Rahman Fabrics">
              <Icon name="mail" />
            </a>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="menu-layer">
          <button className="menu-backdrop" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close navigation menu" />
          <nav className="side-menu" ref={menuRef} role="dialog" aria-modal="true" aria-labelledby="menu-title">
            <div className="side-menu-heading">
              <div>
                <p className="eyebrow">DISCOVER RAHMAN</p>
                <h2 id="menu-title">A little <em>inspiration.</em></h2>
              </div>
              <button className="menu-close" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close navigation menu">×</button>
            </div>
            <div className="side-menu-links">
              <Link to={ROUTES.home} onClick={() => setIsMenuOpen(false)}><span>01</span> Home <b>↗</b></Link>
              <Link to="/#new-arrivals" onClick={() => setIsMenuOpen(false)}><span>02</span> New arrivals <b>↗</b></Link>
              <Link to={ROUTES.shop} onClick={() => setIsMenuOpen(false)}><span>03</span> Shop all <b>↗</b></Link>
              <Link to="/#featured" onClick={() => setIsMenuOpen(false)}><span>04</span> Featured <b>↗</b></Link>
              <Link to="/#collections" onClick={() => setIsMenuOpen(false)}><span>05</span> Collections <b>↗</b></Link>
              <Link to="/#about" onClick={() => setIsMenuOpen(false)}><span>06</span> About us <b>↗</b></Link>
            </div>
            <div className="side-menu-note">
              <span>Thoughtful fabrics,</span>
              <span>made for your everyday.</span>
            </div>
          </nav>
        </div>
      )}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}