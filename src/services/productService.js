import { products as demoProducts } from '../data/products'
import { supabase } from '../lib/supabase/client'

const PRODUCT_BUCKET = 'product-images'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.')
  }
}

function mapProduct(row) {
  return {
    ...row,
    articleNo: row.article_no,
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    imageUrl: row.image_url,
    price: Number(row.price),
  }
}

function toProductRow(product) {
  return {
    slug: product.slug,
    name: product.name.trim(),
    brand: product.brand.trim(),
    article_no: product.articleNo.trim(),
    category: product.category.trim(),
    fabric: product.fabric.trim(),
    pieces: product.pieces.trim(),
    season: product.season.trim(),
    price: Number(product.price),
    old_price: product.oldPrice === '' || product.oldPrice == null ? null : Number(product.oldPrice),
    color: product.color,
    label: product.label.trim() || null,
    description: product.description.trim(),
    stock: Number(product.stock),
    is_active: product.isActive,
  }
}

export async function getActiveProducts() {
  if (!supabase) return demoProducts

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapProduct)
}

export async function getAdminProducts() {
  requireSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapProduct)
}

export async function saveProduct(product, imageFile, existingImagePath = null, productId = null) {
  requireSupabase()

  let uploadedPath = null
  let imageUrl = product.imageUrl || null

  if (imageFile) {
    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    uploadedPath = `${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(uploadedPath, imageFile, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError
    imageUrl = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(uploadedPath).data.publicUrl
  }

  const payload = {
    ...toProductRow(product),
    image_url: imageUrl,
    ...(productId ? {} : { slug: `${slugify(product.name)}-${crypto.randomUUID().slice(0, 8)}` }),
  }

  const query = productId
    ? supabase.from('products').update(payload).eq('id', productId)
    : supabase.from('products').insert(payload)
  const { error } = await query

  if (error) {
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage.from(PRODUCT_BUCKET).remove([uploadedPath])
      if (cleanupError) {
        throw new Error(`${error.message} Image cleanup also failed: ${cleanupError.message}`)
      }
    }
    throw error
  }

  if (uploadedPath && existingImagePath) {
    const { error: removeError } = await supabase.storage.from(PRODUCT_BUCKET).remove([existingImagePath])
    if (removeError) throw removeError
  }
}

export async function deleteProduct(product) {
  requireSupabase()
  const { error } = await supabase.from('products').delete().eq('id', product.id)
  if (error) throw error

  if (product.image_url) {
    const imagePath = getStoragePath(product.image_url)
    if (imagePath) {
      const { error: removeError } = await supabase.storage.from(PRODUCT_BUCKET).remove([imagePath])
      if (removeError) throw removeError
    }
  }
}

export function getStoragePath(imageUrl) {
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`
  const markerIndex = imageUrl?.indexOf(marker) ?? -1
  return markerIndex < 0 ? null : decodeURIComponent(imageUrl.slice(markerIndex + marker.length))
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}