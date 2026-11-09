import ProductCard from "@/components/home/ProductCard";
import ProductCardSkeleton from "@/components/home/ProductCardSkeleton";
import { getProducts } from "@/lib/products";

export function FeaturedSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

/** Real products from your catalog. Each card links to /product/[id]. */
export default async function FeaturedProducts() {
  let products = await getProducts({ featured: true, sort: "newest", limit: 4 });
  if (products.length === 0) products = await getProducts({ sort: "newest", limit: 4 });
  if (products.length === 0) return null;
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
