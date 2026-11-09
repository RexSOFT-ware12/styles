Copy these into your project root, keeping the paths:
  app/page.tsx                      (REPLACES existing)
  app/shop/page.tsx                 (new - the catalog now lives here too)
  components/home/Catalog.tsx       (new)
  components/landing/Landing.tsx    (new - the landing page)
Optional: in components/layout/Header.tsx add { href: "/shop", label: "Shop" } to navItems,
and point footer "All Products" links to "/shop".
Update the user count by editing USERS at the top of Landing.tsx.
