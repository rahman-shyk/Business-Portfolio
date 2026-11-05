# Rahman Fabrics

React + Vite storefront with a Supabase-backed admin dashboard.

## Supabase setup

1. In Supabase, open **Project Settings → API** (or **API Keys**) and copy the **Project URL** and the **publishable key**. On older projects this key is named `anon` or `anon/public`.
2. Copy `.env.example` to `.env` and set:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

   These are browser-side public project credentials. Do **not** put a `service_role`, `secret`, database password, or personal access token in a `VITE_` variable.
3. In the Supabase **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the product and order tables, access policies, order functions, and the public product-image bucket.
4. In **Authentication → Users**, create the admin with email/password. Copy that user's UUID, then add it to the allow-list by running the following SQL with the admin's email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict (user_id) do nothing;
   ```

   Verify the query inserted one row. Only users listed in `admin_users` can access the dashboard data or upload product images.
5. Restart the Vite dev server after changing `.env`, then open `/admin`.

The browser uses only the **publishable/anon key**. Supabase Row Level Security and storage policies protect admin operations. Do not disable RLS or add the service-role key to this application.

## Admin dashboard

At `/admin`, an approved admin can upload and edit products, manage stock and storefront visibility, review customer orders, update order status, and mark cash-on-delivery orders as paid or refunded. Revenue cards count paid orders only. Cancelling an order restores its stock and marks a paid order refunded.

The checkout places **cash-on-delivery** orders through the `place_order` database function. Online payment can be arranged by contacting Rahman Fabrics on WhatsApp; it is not processed directly through this checkout. Delivery is Rs. 500 and negotiable according to the customer's location/address, and delivery timing depends on rider availability. Returns are not accepted; exchanges are available only for specific eligible items.

Product images are stored in the `product-images` public bucket. Upload JPEG, PNG, WebP, or AVIF images up to 10 MB.

## Local development

```sh
npm install
npm run dev
```
