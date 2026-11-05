import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import { ROUTES } from '../constants/routes'
import { useProducts } from '../hooks/useProducts'

const slides = [
  {
    image: '/images/banners/slide-01.jpg',
    theme: 'earth',
    eyebrow: 'THE NEW SEASON / 2026',
    headline: <>Made for the<br /><em>way you feel.</em></>,
    copy: 'Discover fabrics with a little more feeling — thoughtfully chosen, beautifully made, and ready to become yours.',
    action: 'Explore the collection',
    note: 'CRAFTED FOR YOUR EVERYDAY',
  },
  {
    image: '/images/banners/slide-02.jpg',
    theme: 'rose',
    eyebrow: 'A LITTLE MORE YOU / NEW PRINTS',
    headline: <>Colour your days<br /><em>your way.</em></>,
    copy: 'Meet expressive prints, easy-to-wear lawn, and details made to bring a fresh point of view to your wardrobe.',
    action: 'Shop new arrivals',
    note: 'FRESH PRINTS, EASY FEEL',
  },
  {
    image: '/images/banners/slide-03.jpg',
    theme: 'blue',
    eyebrow: 'MADE TO BE KEPT / RAHMAN FABRICS',
    headline: <>Feel the difference<br /><em>in every thread.</em></>,
    copy: 'From breathable cotton to occasion-ready textures, find considered fabrics for everyday moments and the ones worth celebrating.',
    action: 'Find your fabric',
    note: 'THOUGHTFUL FROM THE START',
  },
]

export default function Home() {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const slide = slides[activeSlide]

  useEffect(() => {
    if (!isPlaying) return undefined

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [isPlaying])

  const showSlide = (index) => {
    setActiveSlide((index + slides.length) % slides.length)
  }

  return (
    <>
      <section
        className={`home-hero home-hero--${slide.theme}`}
        aria-roledescription="carousel"
        aria-label="Rahman Fabrics featured collections"
        style={{ '--hero-art': `url("${slide.image}")` }}
      >
        <div className="container hero-content" key={activeSlide} aria-live="polite">
          <p className="eyebrow hero-copy-in">{slide.eyebrow}</p>
          <h1 className="hero-title-in">{slide.headline}</h1>
          <p className="hero-copy hero-copy-in hero-description-in">{slide.copy}</p>
          <Link className="button button-light hero-copy-in hero-action-in" to={ROUTES.shop}>
            {slide.action} <span>↗</span>
          </Link>
        </div>
        {/* <div className="hero-stamp" aria-hidden="true">
          <span>MADE WITH</span>
          <strong>feeling</strong>
          <span>RAHMAN FABRICS</span>
        </div> */}
        <div className="hero-controls container">
          <div className="hero-caption">
            <span className="hero-index">0{activeSlide + 1}<i> / 0{slides.length}</i></span>
            <span>{slide.note}</span>
          </div>
          <div className="hero-control-actions" aria-label="Slider controls">
            <button type="button" className="hero-arrow" onClick={() => showSlide(activeSlide - 1)} aria-label="Previous slide">←</button>
            <div className="hero-dots" role="group" aria-label="Choose a slide">
              {slides.map((item, index) => (
                <button
                  type="button"
                  key={item.image}
                  className={index === activeSlide ? 'hero-dot is-active' : 'hero-dot'}
                  onClick={() => showSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeSlide ? 'true' : undefined}
                />
              ))}
            </div>
            <button type="button" className="hero-arrow" onClick={() => showSlide(activeSlide + 1)} aria-label="Next slide">→</button>
            <button
              type="button"
              className="hero-play"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? 'Pause automatic slides' : 'Play automatic slides'}
            >
              {isPlaying ? 'Ⅱ' : '▶'}
            </button>
          </div>
        </div>
      </section>

      <section className="section container" id="collections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2 id="new-arrivals">Pieces to feel good in.</h2>
          </div>
          <Link className="text-link" to={ROUTES.shop}>View all pieces <span>↗</span></Link>
        </div>
        {productsError
          ? <p role="alert" className="empty-message">Could not load products: {productsError}</p>
          : productsLoading
            ? <p role="status" className="empty-message">Loading the collection…</p>
            : <ProductGrid products={products.slice(0, 4)} />}
      </section>

      <section className="story-band" id="about">
        <div className="container story-inner">
          <p className="eyebrow">OUR WAY OF MAKING</p>
          <h2>Good fabric.<br /><em>Better days.</em></h2>
          <p>We believe what you wear should feel as good as it looks. So we seek out thoughtful prints, easy textures, and pieces you’ll reach for again and again.</p>
          <Link className="text-link" to={ROUTES.shop}>Find your new favourite <span>↗</span></Link>
        </div>
      </section>

      <section className="section container" id="featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE RAHMAN EDIT</p>
            <h2>New, and already loved.</h2>
          </div>
          <Link className="text-link" to={ROUTES.shop}>Shop new arrivals <span>↗</span></Link>
        </div>
        {productsError
          ? <p role="alert" className="empty-message">Could not load products: {productsError}</p>
          : productsLoading
            ? <p role="status" className="empty-message">Loading the collection…</p>
            : <ProductGrid products={products.slice(4, 8)} />}
      </section>
    </>
  )
}