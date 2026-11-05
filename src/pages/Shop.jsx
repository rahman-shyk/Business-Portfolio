import { useMemo, useState } from 'react'
import ProductGrid from '../components/product/ProductGrid'
import { useProducts } from '../hooks/useProducts'

const brands = ['NISHAT', 'MTJ', 'Charizma', 'Safina', 'MoosaJee']
const categories = ['Cotton', 'Lawn', 'Khaddar', 'Formal']
const initialFilters = { categories: [], brands: [], maxPrice: 10000, discounted: false }

export default function Shop() {
  const { products, loading, error } = useProducts()
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand)
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category)
      const matchesPrice = product.price <= filters.maxPrice
      const matchesDiscount = !filters.discounted || Boolean(product.oldPrice)
      const matchesSearch = !query || [
        product.name,
        product.brand,
        product.articleNo,
        product.category,
        product.fabric,
      ].some((value) => value.toLowerCase().includes(query))

      return matchesBrand && matchesCategory && matchesPrice && matchesDiscount && matchesSearch
    })

    return filtered.sort((first, second) => {
      if (sortBy === 'price-low') return first.price - second.price
      if (sortBy === 'price-high') return second.price - first.price
      if (sortBy === 'name') return first.name.localeCompare(second.name)
      return products.indexOf(first) - products.indexOf(second)
    })
  }, [filters, products, search, sortBy])

  const activeFilterCount =
    filters.brands.length +
    filters.categories.length +
    (filters.maxPrice < initialFilters.maxPrice ? 1 : 0) +
    (filters.discounted ? 1 : 0)
  const hasShopChanges = activeFilterCount > 0 || search.length > 0 || sortBy !== 'featured'

  const toggleFilterValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setSearch('')
    setSortBy('featured')
  }

  return (
    <section className="shop-page section container">
      <div className="shop-intro">
        <p className="eyebrow">THE RAHMAN FABRICS EDIT</p>
        <h1>Find your <em>fabric.</em></h1>
        <p>Explore unstitched collections from NISHAT, MTJ, Charizma, Safina, and MoosaJee. Find your next favourite by brand, fabric, article, or budget.</p>
      </div>

      <div className="shop-toolbar">
        <label className="shop-search">
          <span className="sr-only">Search products, brands, or article number</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brand, fabric, article..."
          />
        </label>
        <button className="filter-toggle" type="button" onClick={() => setIsFilterOpen((open) => !open)} aria-expanded={isFilterOpen}>
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          <span aria-hidden="true">{isFilterOpen ? '−' : '+'}</span>
        </button>
        <label className="sort-control">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
      </div>

      <div className="shop-results-layout">
        <aside className={isFilterOpen ? 'shop-filters is-open' : 'shop-filters'} aria-label="Product filters">
          <div className="filters-heading">
            <h2>Refine your edit</h2>
            <button type="button" onClick={clearFilters}>Clear all</button>
          </div>
          <fieldset className="filter-group">
            <legend>Brand</legend>
            {brands.map((brand) => (
              <label className="filter-option" key={brand}>
                <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggleFilterValue('brands', brand)} />
                <span>{brand}</span>
                <small>{products.filter((product) => product.brand === brand).length}</small>
              </label>
            ))}
          </fieldset>
          <fieldset className="filter-group">
            <legend>Fabric & category</legend>
            {categories.map((category) => (
              <label className="filter-option" key={category}>
                <input type="checkbox" checked={filters.categories.includes(category)} onChange={() => toggleFilterValue('categories', category)} />
                <span>{category}</span>
                <small>{products.filter((product) => product.category === category).length}</small>
              </label>
            ))}
          </fieldset>
          <fieldset className="filter-group price-filter">
            <legend>Maximum price</legend>
            <label htmlFor="max-price">Up to {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(filters.maxPrice)}</label>
            <input
              id="max-price"
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={filters.maxPrice}
              onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
            />
            <div className="range-labels"><span>Rs. 2,000</span><span>Rs. 10,000+</span></div>
          </fieldset>
          <label className="filter-option discount-filter">
            <input type="checkbox" checked={filters.discounted} onChange={(event) => setFilters((current) => ({ ...current, discounted: event.target.checked }))} />
            <span>On sale</span>
          </label>
        </aside>

        <div className="shop-results">
          <div className="results-heading">
            <p><strong>{loading ? '…' : visibleProducts.length}</strong> {visibleProducts.length === 1 ? 'article' : 'articles'} available</p>
            {hasShopChanges && <button type="button" onClick={clearFilters}>Clear filters</button>}
          </div>
          {error ? (
            <div className="shop-empty" role="alert">
              <p className="eyebrow">COULD NOT LOAD THE COLLECTION</p>
              <h2>Please try again shortly.</h2>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <p className="empty-message" role="status">Loading the collection…</p>
          ) : visibleProducts.length > 0 ? (
            <ProductGrid products={visibleProducts} />
          ) : (
            <div className="shop-empty">
              <p className="eyebrow">NO MATCHES THIS TIME</p>
              <h2>Try a different combination.</h2>
              <p>Clear some filters or search by another brand, fabric, or article number.</p>
              <button className="button button-dark" type="button" onClick={clearFilters}>Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}