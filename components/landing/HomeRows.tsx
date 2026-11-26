import ProductCard from "@/components/home/ProductCard";
import { getProducts } from "@/lib/products";
import { getBestsellers } from "@/lib/store";
import type { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function Row({ title, eyebrow, href, products }: { title: string; eyebrow: string; href?: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="px-4 pb-10 lg:pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          </div>
          {href && (
            <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Best sellers, on-sale and new-this-week rows. A row with nothing in it simply isn't shown. */
export default async function HomeRows() {
  const weekAgo = Date.now() - 7 * 86400000;
  const [best, sale, fresh] = await Promise.all([
    getBestsellers(4),
    getProducts({ onSale: true, sort: "newest", limit: 4 }),
    getProducts({ sort: "newest", limit: 8 }),
  ]);
  const newThisWeek = fresh.filter((p) => p.createdAt && new Date(p.createdAt).getTime() > weekAgo).slice(0, 4);
  return (
    <>
      <Row eyebrow="Most loved" title="Best sellers" products={best} />
      <Row eyebrow="Limited-time prices" title="On sale now" href="/shop?onSale=true" products={sale} />
      <Row eyebrow="Just dropped" title="New this week" href="/shop" products={newThisWeek} />
    </>
  );
}
