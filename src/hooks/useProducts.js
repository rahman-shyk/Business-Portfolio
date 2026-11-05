import { useEffect, useState } from 'react'
import { products as demoProducts } from '../data/products'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { getActiveProducts } from '../services/productService'

export function useProducts() {
  const [products, setProducts] = useState(isSupabaseConfigured ? [] : demoProducts)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    getActiveProducts()
      .then((items) => {
        if (active) setProducts(items)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { products, loading, error }
}
