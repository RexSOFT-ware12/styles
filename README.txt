Copy into your project root, keeping paths (replace existing where they exist):
  app/page.tsx                            (replaces)
  app/loading.tsx                         (replaces - was the product-grid skeleton that flashed on refresh)
  app/shop/page.tsx, app/shop/loading.tsx (new)
  components/home/Catalog.tsx             (new)
  components/landing/Landing.tsx          (new)
  components/landing/FeaturedProducts.tsx (new - real product cards -> /product/[id])
  components/layout/Header.tsx            (replaces - adds "Shop" nav link)
  components/layout/Footer.tsx            (replaces - product links now go to /shop)
Edit USERS at top of Landing.tsx to update the user count.

Partners section: add logo files to public/images/partners/ (see PUT-LOGOS-HERE.txt).
