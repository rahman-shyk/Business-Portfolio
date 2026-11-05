
#!/usr/bin/env bash

set -e

echo "Setting up Rahman Fabrics e-commerce frontend..."

# Public assets
mkdir -p public/images/products
mkdir -p public/images/banners
mkdir -p public/images/categories
mkdir -p public/images/brand

# Main source folders
mkdir -p src/assets/fonts
mkdir -p src/assets/images

# Reusable components
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/product
mkdir -p src/components/cart
mkdir -p src/components/checkout

# Pages
mkdir -p src/pages/auth
mkdir -p src/pages/shop
mkdir -p src/pages/product
mkdir -p src/pages/cart
mkdir -p src/pages/checkout
mkdir -p src/pages/account
mkdir -p src/pages/info

# Application logic
mkdir -p src/routes
mkdir -p src/hooks
mkdir -p src/context

# Data and Supabase integration
mkdir -p src/data
mkdir -p src/lib/supabase
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/constants

# Styling
mkdir -p src/styles

# Starter files: create only if missing
files=(
  "src/components/layout/Navbar.jsx"
  "src/components/layout/Footer.jsx"
  "src/components/layout/AnnouncementBar.jsx"
  "src/components/product/ProductCard.jsx"
  "src/components/product/ProductGrid.jsx"
  "src/components/cart/CartDrawer.jsx"
  "src/pages/Home.jsx"
  "src/pages/Shop.jsx"
  "src/pages/ProductDetails.jsx"
  "src/pages/Cart.jsx"
  "src/pages/Checkout.jsx"
  "src/pages/NotFound.jsx"
  "src/context/CartContext.jsx"
  "src/data/products.js"
  "src/lib/supabase/client.js"
  "src/services/productService.js"
  "src/services/orderService.js"
  "src/utils/formatPrice.js"
  "src/constants/routes.js"
  "src/styles/variables.css"
  ".env.example"
)

for file in "${files[@]}"; do
  if [ ! -e "$file" ]; then
    touch "$file"
    echo "Created: $file"
  else
    echo "Skipped existing file: $file"
  fi
done

echo ""
echo "Project structure created successfully!"
echo "Your existing files have been preserved."
