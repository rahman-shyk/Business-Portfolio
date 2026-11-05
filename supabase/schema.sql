create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  article_no text not null unique,
  category text not null,
  fabric text not null,
  pieces text not null,
  season text not null,
  price numeric(12, 2) not null check (price >= 0),
  old_price numeric(12, 2) check (old_price is null or old_price >= price),
  color text not null default 'sand',
  label text,
  description text not null,
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  paid_at timestamptz,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  article_no text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists products_active_created_idx
  on public.products (is_active, created_at desc);
create index if not exists orders_created_idx
  on public.orders (created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on public.admin_users to authenticated;

create policy "Admins can read their own admin record"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Anyone can read active products"
  on public.products for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "Admins manage products"
  on public.products for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins read orders"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

create policy "Admins read order items"
  on public.order_items for select to authenticated
  using ((select public.is_admin()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view product images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create or replace function public.place_order(order_data jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order_id uuid;
  new_order_number bigint;
  item jsonb;
  selected_product public.products%rowtype;
  item_quantity integer;
  calculated_subtotal numeric(12, 2) := 0;
  customer_name_value text;
  email_value text;
  phone_value text;
  address_value text;
  city_value text;
begin
  customer_name_value := trim(coalesce(order_data->>'customer_name', ''));
  email_value := trim(coalesce(order_data->>'email', ''));
  phone_value := trim(coalesce(order_data->>'phone', ''));
  address_value := trim(coalesce(order_data->>'address', ''));
  city_value := trim(coalesce(order_data->>'city', ''));

  if customer_name_value = '' or email_value = '' or phone_value = ''
    or address_value = '' or city_value = '' then
    raise exception 'All customer and delivery fields are required';
  end if;

  if length(customer_name_value) > 160 or length(email_value) > 320
    or length(phone_value) > 40 or length(address_value) > 500
    or length(city_value) > 120 then
    raise exception 'One or more order fields are too long';
  end if;

  if jsonb_typeof(order_data->'items') <> 'array'
    or jsonb_array_length(order_data->'items') = 0
    or jsonb_array_length(order_data->'items') > 50 then
    raise exception 'Order must contain between 1 and 50 items';
  end if;

  for item in select value from jsonb_array_elements(order_data->'items')
  loop
    item_quantity := (item->>'quantity')::integer;
    if item_quantity < 1 or item_quantity > 99 then
      raise exception 'Item quantity must be between 1 and 99';
    end if;

    select * into selected_product
    from public.products
    where id = (item->>'product_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'A selected product is no longer available';
    end if;
    if selected_product.stock < item_quantity then
      raise exception 'Insufficient stock for article %', selected_product.article_no;
    end if;

    calculated_subtotal := calculated_subtotal + selected_product.price * item_quantity;
  end loop;

  insert into public.orders (customer_name, email, phone, address, city, subtotal)
  values (
    customer_name_value,
    email_value,
    phone_value,
    address_value,
    city_value,
    calculated_subtotal
  )
  returning id, order_number into new_order_id, new_order_number;

  for item in select value from jsonb_array_elements(order_data->'items')
  loop
    item_quantity := (item->>'quantity')::integer;
    select * into selected_product
    from public.products
    where id = (item->>'product_id')::uuid and is_active;

    insert into public.order_items (
      order_id, product_id, product_name, article_no, unit_price, quantity
    )
    values (
      new_order_id,
      selected_product.id,
      selected_product.name,
      selected_product.article_no,
      selected_product.price,
      item_quantity
    );

    update public.products
    set stock = stock - item_quantity, updated_at = now()
    where id = selected_product.id;
  end loop;

  return new_order_number;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

create or replace function public.set_order_status(order_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order public.orders%rowtype;
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;
  if new_status not in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid order status';
  end if;

  select * into current_order
  from public.orders
  where id = order_id
  for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if current_order.status = 'cancelled' and new_status <> 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened';
  end if;

  if new_status = 'cancelled' and current_order.status <> 'cancelled' then
    update public.products p
    set stock = p.stock + items.quantity, updated_at = now()
    from public.order_items items
    where items.order_id = order_id
      and items.product_id = p.id;
  end if;

  update public.orders
  set status = new_status,
      payment_status = case
        when new_status = 'cancelled' and payment_status = 'paid' then 'refunded'
        else payment_status
      end,
      paid_at = case
        when new_status = 'cancelled' then null
        else paid_at
      end,
      updated_at = now()
  where id = order_id;
end;
$$;

revoke all on function public.set_order_status(uuid, text) from public;
grant execute on function public.set_order_status(uuid, text) to authenticated;

create or replace function public.set_order_payment_status(order_id uuid, new_payment_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;
  if new_payment_status not in ('unpaid', 'paid', 'refunded') then
    raise exception 'Invalid payment status';
  end if;

  update public.orders
  set payment_status = new_payment_status,
      paid_at = case when new_payment_status = 'paid' then now() else null end,
      updated_at = now()
  where id = order_id and status <> 'cancelled';
  if not found then
    raise exception 'Order not found or cancelled';
  end if;
end;
$$;

revoke all on function public.set_order_payment_status(uuid, text) from public;
grant execute on function public.set_order_payment_status(uuid, text) to authenticated;
