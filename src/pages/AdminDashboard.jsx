import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../utils/formatPrice'
import { supabase } from '../lib/supabase/client'
import { getAdminProducts, saveProduct, deleteProduct, getStoragePath } from '../services/productService'
import { getAdminOrders, updateOrderStatus, updatePaymentStatus } from '../services/orderService'

const emptyProduct = {
  name: '',
  brand: 'NISHAT',
  articleNo: '',
  category: 'Lawn',
  fabric: '',
  pieces: '3-piece unstitched',
  season: 'Spring / Summer',
  price: '',
  oldPrice: '',
  color: 'sand',
  label: '',
  description: '',
  stock: '1',
  isActive: true,
  imageUrl: '',
}

const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
function asDate(value) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function orderNumber(order) {
  return `RF-${String(order.order_number).padStart(6, '0')}`
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [access, setAccess] = useState('checking')
  const [pageError, setPageError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [productImage, setProductImage] = useState(null)
  const [productError, setProductError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadData = useCallback(async () => {
    setLoadingData(true)
    setPageError('')
    try {
      const [nextProducts, nextOrders] = await Promise.all([getAdminProducts(), getAdminOrders()])
      setProducts(nextProducts)
      setOrders(nextOrders)
    } catch (error) {
      setPageError(error.message)
    } finally {
      setLoadingData(false)
    }
  }, [])

  const checkAdmin = useCallback(async (currentSession) => {
    if (!currentSession?.user) {
      setSession(null)
      setAccess('signed-out')
      return
    }

    setSession(currentSession)
    setAccess('checking')
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', currentSession.user.id)
      .maybeSingle()

    if (error) {
      setPageError(error.message)
      setAccess('signed-out')
      return
    }

    setPageError('')
    if (data) {
      setAccess('admin')
      await loadData()
    } else {
      setAccess('denied')
    }
  }, [loadData])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setPageError(error.message)
        setAccess('signed-out')
        return
      }
      checkAdmin(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) checkAdmin(nextSession)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [checkAdmin])

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => !query || [
      product.name,
      product.brand,
      product.articleNo,
    ].some((value) => value?.toLowerCase().includes(query)))
  }, [products, search])

  const visibleOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === statusFilter)
  const revenue = orders
    .filter((order) => order.payment_status === 'paid')
    .reduce((total, order) => total + Number(order.subtotal), 0)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthRevenue = orders
    .filter((order) => order.payment_status === 'paid' && order.paid_at && new Date(order.paid_at) >= monthStart)
    .reduce((total, order) => total + Number(order.subtotal), 0)
  const pendingOrders = orders.filter((order) => order.status === 'pending').length

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')
    setPageError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoginError(error.message)
      return
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (adminError) {
      await supabase.auth.signOut()
      setLoginError(adminError.message)
      return
    }
    if (!adminRecord) {
      await supabase.auth.signOut()
      setLoginError('This account does not have administrator access.')
      return
    }

    setSession(data.session)
    setAccess('admin')
    await loadData()
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setPageError(error.message)
    else {
      setSession(null)
      setAccess('signed-out')
    }
  }

  const openNewProduct = () => {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setProductImage(null)
    setProductError('')
    setProductFormOpen(true)
  }

  const openEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      brand: product.brand,
      articleNo: product.articleNo,
      category: product.category,
      fabric: product.fabric,
      pieces: product.pieces,
      season: product.season,
      price: String(product.price),
      oldPrice: product.oldPrice == null ? '' : String(product.oldPrice),
      color: product.color,
      label: product.label || '',
      description: product.description,
      stock: String(product.stock),
      isActive: product.is_active,
      imageUrl: product.image_url || '',
    })
    setProductImage(null)
    setProductError('')
    setProductFormOpen(true)
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    setProductError('')
    if (!editingProduct && !productImage) {
      setProductError('Choose a product image before publishing this article.')
      return
    }
    if (productImage && productImage.size > 10 * 1024 * 1024) {
      setProductError('Image must be 10 MB or smaller.')
      return
    }

    setSavingProduct(true)
    try {
      await saveProduct(
        productForm,
        productImage,
        editingProduct ? getStoragePath(editingProduct.image_url) : null,
        editingProduct?.id,
      )
      setProductFormOpen(false)
      await loadData()
    } catch (error) {
      setProductError(error.message)
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name} (${product.articleNo})?`)) return
    setPageError('')
    try {
      await deleteProduct(product)
      await loadData()
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handleStatusChange = async (order, status) => {
    setPageError('')
    try {
      await updateOrderStatus(order.id, status)
      setOrders((current) => current.map((item) => item.id === order.id ? {
        ...item,
        status,
        ...(status === 'cancelled' && item.payment_status === 'paid'
          ? { payment_status: 'refunded', paid_at: null }
          : {}),
      } : item))
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handlePaymentChange = async (order, status) => {
    setPageError('')
    try {
      await updatePaymentStatus(order.id, status)
      setOrders((current) => current.map((item) => item.id === order.id ? {
        ...item,
        payment_status: status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      } : item))
    } catch (error) {
      setPageError(error.message)
    }
  }

  if (!supabase) {
    return (
      <main className="admin-setup">
        <p className="eyebrow">RAHMAN FABRICS / ADMIN</p>
        <h1>Connect your store.</h1>
        <p>Add your Supabase project URL and <strong>publishable</strong> key to <code>.env</code>, then run the setup SQL file in the Supabase SQL Editor.</p>
        <p>Use <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>. Never add a service-role or secret key to this frontend.</p>
        <p>Setup instructions: <code>supabase/schema.sql</code></p>
      </main>
    )
  }

  if (access === 'checking') {
    return <main className="admin-auth-screen"><p role="status">Checking administrator access…</p></main>
  }

  if (access === 'signed-out' || access === 'denied') {
    return (
      <main className="admin-auth-screen">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <p className="eyebrow">RAHMAN FABRICS / PRIVATE</p>
          <h1>Admin sign in</h1>
          <p>Sign in with the administrator account you created in Supabase Auth.</p>
          {access === 'denied' && <p className="admin-error" role="alert">This account is not assigned administrator access.</p>}
          <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {(loginError || pageError) && <p className="admin-error" role="alert">{loginError || pageError}</p>}
          <button className="button button-dark button-wide" type="submit">Sign in to dashboard <span>↗</span></button>
        </form>
      </main>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">RAHMAN <span>ADMIN</span></a>
        <p className="admin-side-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin dashboard">
          <button className={activeTab === 'overview' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('overview')}><span>◫</span> Overview</button>
          <button className={activeTab === 'products' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('products')}><span>▧</span> Products</button>
          <button className={activeTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders')}><span>▤</span> Orders {pendingOrders > 0 && <i>{pendingOrders}</i>}</button>
        </nav>
        <div className="admin-profile">
          <span>{session?.user?.email?.slice(0, 1).toUpperCase()}</span>
          <div><strong>Store administrator</strong><small>{session?.user?.email}</small></div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">STORE MANAGEMENT</p>
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'products' ? 'Products' : 'Orders'}</h1>
          </div>
          <div className="admin-top-actions">
            <button type="button" className="admin-refresh" onClick={loadData} disabled={loadingData}>{loadingData ? 'Refreshing…' : '↻ Refresh'}</button>
            <button type="button" className="admin-signout" onClick={handleSignOut}>Sign out</button>
          </div>
        </header>

        {pageError && <p className="admin-banner-error" role="alert">{pageError}</p>}
        {loadingData && <p className="admin-loading" role="status">Loading store data…</p>}

        {activeTab === 'overview' && (
          <section className="admin-content">
            <div className="admin-welcome">
              <div><span className="admin-live-dot" /> STORE SNAPSHOT</div>
              <p>Your store at a glance. Collected revenue includes orders manually marked as paid.</p>
            </div>
            <div className="admin-stats-grid">
              <article className="admin-stat-card"><span>Collected revenue</span><strong>{formatPrice(revenue)}</strong><small>Orders marked paid</small></article>
              <article className="admin-stat-card"><span>Collected this month</span><strong>{formatPrice(monthRevenue)}</strong><small>Paid orders month-to-date</small></article>
              <article className="admin-stat-card"><span>Orders</span><strong>{orders.length}</strong><small>{pendingOrders} awaiting confirmation</small></article>
              <article className="admin-stat-card"><span>Active articles</span><strong>{products.filter((product) => product.is_active).length}</strong><small>{products.reduce((sum, product) => sum + Number(product.stock), 0)} pieces in stock</small></article>
            </div>
            <div className="admin-overview-grid">
              <section className="admin-panel">
                <div className="admin-panel-heading"><div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent orders</h2></div><button type="button" onClick={() => setActiveTab('orders')}>View all →</button></div>
                {orders.length === 0 ? <p className="admin-empty">New customer orders will show here.</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead>
                      <tbody>{orders.slice(0, 5).map((order) => (
                          <tr key={order.id}><td>{orderNumber(order)}</td><td>{order.customer_name}</td><td>{asDate(order.created_at)}</td><td><StatusBadge status={order.status} /></td><td><StatusBadge status={order.payment_status} /></td><td>{formatPrice(Number(order.subtotal))}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </section>
              <section className="admin-panel admin-shortcuts">
                <p className="eyebrow">QUICK ACTIONS</p>
                <h2>Keep your shop fresh.</h2>
                <p>Add a new article or review the latest customer orders.</p>
                <button className="button button-dark" type="button" onClick={openNewProduct}>＋ Add product</button>
                <button className="admin-secondary-button" type="button" onClick={() => setActiveTab('orders')}>Review orders <span>↗</span></button>
              </section>
            </div>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="admin-content">
            <div className="admin-list-toolbar">
              <label className="admin-search"><span className="sr-only">Search products</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, brand, article…" /></label>
              <button className="button button-dark" type="button" onClick={openNewProduct}>＋ Add product</button>
            </div>
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><p className="eyebrow">INVENTORY</p><h2>All articles <span>({visibleProducts.length})</span></h2></div></div>
              {visibleProducts.length === 0 ? <p className="admin-empty">No products here yet. Add your first article to start building your catalogue.</p> : (
                <div className="admin-table-wrap">
                  <table className="admin-table product-admin-table">
                    <thead><tr><th>Article</th><th>Brand / Article no.</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead>
                    <tbody>{visibleProducts.map((product) => (
                      <tr key={product.id}>
                        <td><div className="admin-product-cell">{product.image_url ? <img src={product.image_url} alt="" /> : <span className={`admin-product-placeholder product-art--${product.color}`} />}<strong>{product.name}</strong></div></td>
                        <td>{product.brand}<small className="admin-cell-subtitle">{product.articleNo}</small></td>
                        <td>{formatPrice(product.price)}{product.oldPrice && <del className="admin-old-price">{formatPrice(product.oldPrice)}</del>}</td>
                        <td>{product.stock}</td>
                        <td><StatusBadge status={product.is_active ? 'active' : 'hidden'} /></td>
                        <td><div className="admin-row-actions"><button type="button" onClick={() => openEditProduct(product)}>Edit</button><button type="button" onClick={() => handleDeleteProduct(product)}>Delete</button></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="admin-content">
            <div className="admin-list-toolbar">
              <p className="admin-order-summary">{orders.length} total orders · {pendingOrders} pending</p>
              <label className="sort-control"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All orders</option>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </div>
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><p className="eyebrow">CUSTOMER ACTIVITY</p><h2>Order management</h2></div></div>
              {visibleOrders.length === 0 ? <p className="admin-empty">No orders match this view yet.</p> : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-orders-table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Date</th><th>Total</th><th>Order status</th><th>Payment</th></tr></thead>
                    <tbody>{visibleOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{orderNumber(order)}</strong></td>
                        <td>{order.customer_name}<small className="admin-cell-subtitle">{order.email} · {order.phone}</small><small className="admin-cell-subtitle">{order.address}, {order.city}</small></td>
                        <td><details className="order-items-details"><summary>{order.order_items.length} {order.order_items.length === 1 ? 'article' : 'articles'}</summary>{order.order_items.map((item) => <p key={item.id}>{item.product_name} ({item.article_no}) × {item.quantity}</p>)}</details></td>
                        <td>{asDate(order.created_at)}</td>
                        <td>{formatPrice(Number(order.subtotal))}</td>
                        <td><select className={`status-select status-${order.status}`} aria-label={`Update status for ${orderNumber(order)}`} value={order.status} onChange={(event) => handleStatusChange(order, event.target.value)}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                        <td><select className={`status-select status-${order.payment_status}`} aria-label={`Update payment status for ${orderNumber(order)}`} value={order.payment_status} disabled={order.status === 'cancelled'} onChange={(event) => handlePaymentChange(order, event.target.value)}>{['unpaid', 'paid', 'refunded'].map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        )}
      </main>

      {productFormOpen && (
        <div className="admin-modal-layer">
          <button className="admin-modal-backdrop" type="button" onClick={() => setProductFormOpen(false)} aria-label="Close product form" />
          <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
            <header className="admin-modal-heading"><div><p className="eyebrow">INVENTORY / ARTICLE</p><h2 id="product-form-title">{editingProduct ? 'Edit article' : 'Add a new article'}</h2></div><button type="button" className="menu-close" onClick={() => setProductFormOpen(false)} aria-label="Close">×</button></header>
            <form className="admin-product-form" onSubmit={handleSaveProduct}>
              <label className="admin-image-upload">Product photo <span>{editingProduct ? 'Choose a new photo to replace the current one' : 'JPG, PNG, WebP or AVIF · 10 MB max'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setProductImage(event.target.files?.[0] || null)} required={!editingProduct} /></label>
              <div className="admin-form-grid">
                <label>Product name<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
                <label>Brand<select value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })}>{['NISHAT', 'MTJ', 'Charizma', 'Safina', 'MoosaJee'].map((brand) => <option key={brand}>{brand}</option>)}</select></label>
                <label>Article number<input value={productForm.articleNo} onChange={(event) => setProductForm({ ...productForm, articleNo: event.target.value })} required /></label>
                <label>Category<select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>{['Cotton', 'Lawn', 'Khaddar', 'Formal'].map((category) => <option key={category}>{category}</option>)}</select></label>
                <label>Fabric<input value={productForm.fabric} onChange={(event) => setProductForm({ ...productForm, fabric: event.target.value })} required /></label>
                <label>Pieces / set<input value={productForm.pieces} onChange={(event) => setProductForm({ ...productForm, pieces: event.target.value })} required /></label>
                <label>Price (PKR)<input type="number" min="0" step="1" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
                <label>Compare-at price<input type="number" min="0" step="1" value={productForm.oldPrice} onChange={(event) => setProductForm({ ...productForm, oldPrice: event.target.value })} /></label>
                <label>Season<input value={productForm.season} onChange={(event) => setProductForm({ ...productForm, season: event.target.value })} required /></label>
                <label>Stock quantity<input type="number" min="0" step="1" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required /></label>
                <label>Image color<select value={productForm.color} onChange={(event) => setProductForm({ ...productForm, color: event.target.value })}>{['sand', 'rose', 'olive', 'blue'].map((color) => <option key={color}>{color}</option>)}</select></label>
                <label>Product badge<input value={productForm.label} onChange={(event) => setProductForm({ ...productForm, label: event.target.value })} placeholder="New arrival / Bestseller" /></label>
              </div>
              <label>Description<textarea rows="4" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required /></label>
              <label className="admin-active-toggle"><input type="checkbox" checked={productForm.isActive} onChange={(event) => setProductForm({ ...productForm, isActive: event.target.checked })} /> Visible in the storefront</label>
              {productError && <p className="admin-error" role="alert">{productError}</p>}
              <div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={() => setProductFormOpen(false)}>Cancel</button><button className="button button-dark" type="submit" disabled={savingProduct}>{savingProduct ? 'Saving…' : editingProduct ? 'Save changes' : 'Publish article'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
