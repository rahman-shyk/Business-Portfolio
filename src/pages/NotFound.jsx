import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function NotFound() {
  return (
    <section className="section container not-found">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>This page took<br /><em>another path.</em></h1>
      <Link className="button button-dark" to={ROUTES.home}>Back to home <span>↗</span></Link>
    </section>
  )
}