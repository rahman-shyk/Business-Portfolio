import { supabase } from '../lib/supabase/client'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.')
  }
}

export async function createOrder({ customer, items }) {
  requireSupabase()
  const { data, error } = await supabase.rpc('place_order', {
    order_data: {
      customer_name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      items: items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
      })),
    },
  })

  if (error) throw error
  return data
}

export async function getAdminOrders() {
  requireSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(id, product_name, article_no, unit_price, quantity)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId, status) {
  requireSupabase()
  const { error } = await supabase.rpc('set_order_status', {
    order_id: orderId,
    new_status: status,
  })

  if (error) throw error
}

export async function updatePaymentStatus(orderId, status) {
  requireSupabase()
  const { error } = await supabase.rpc('set_order_payment_status', {
    order_id: orderId,
    new_payment_status: status,
  })
  if (error) throw error
}