"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { getProductByIdWithStatus } from "@/lib/products";
import type { Product } from "@/types/product";
import { Check, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const dash = "—";

function fileSize(p: Product) {
  const b = p.digitalFile?.size;
  return typeof b === "number" && b > 0 ? `${(b / (1024 * 1024)).toFixed(1)} MB` : dash;
}

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all(ids.map((id) => getProductByIdWithStatus(id))).then((res) => {
      if (!alive) return;
      setProducts(res.map((r) => r.product).filter((p): p is Product => !!p));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [ids]);

  const rows: { label: string; value: (p: Product) => React.ReactNode }[] = [
    {
      label: "Price",
      value: (p) => (
        <span className="font-semibold">
          ${p.price.toFixed(2)}
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span className="ml-2 text-xs font-normal text-muted-foreground line-through">${p.compareAtPrice.toFixed(2)}</span>
          )}
        </span>
      ),
    },
    { label: "Rating", value: (p) => (p.rating ? `${p.rating} (${p.reviewCount} reviews)` : dash) },
    { label: "Fabric", value: (p) => p.fabric || dash },
    { label: "Style", value: (p) => p.style || dash },
    { label: "Category", value: (p) => p.category || dash },
    { label: "Colour", value: (p) => p.color || dash },
    { label: "File", value: (p) => p.digitalFile?.originalName || dash },
    { label: "File size", value: fileSize },
    { label: "Available", value: (p) => (p.hasDigitalFile ? "Yes — instant download" : "Not yet") },
  ];

  if (ids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold">Nothing to compare yet</h1>
        <p className="mb-6 text-muted-foreground">Tick “Compare” on two or three products in the shop to see them side by side.</p>
        <Button asChild><Link href="/shop">Browse the shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Compare products</h1>
        <Button variant="ghost" size="sm" onClick={clear}>Clear all</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 align-top">
                <th className="w-32 p-4 text-left font-medium text-muted-foreground" />
                {products.map((p) => (
                  <th key={p.id} className="relative p-4 text-left">
                    <button type="button" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`} className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/product/${p.id}`} className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="mb-3 aspect-square w-full max-w-[200px] rounded-lg bg-muted object-cover" />
                      <span className="font-semibold text-foreground hover:text-primary">{p.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b last:border-0">
                  <th scope="row" className="p-4 text-left font-medium text-muted-foreground">{r.label}</th>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">{r.value(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4" />
                {products.map((p) => (
                  <td key={p.id} className="p-4">
                    <Button
                      disabled={!p.hasDigitalFile}
                      onClick={() => {
                        addToCart({ id: p.id, name: p.name, price: p.price, image: p.image });
                        setAdded(String(p.id));
                        setTimeout(() => setAdded(null), 1800);
                      }}
                    >
                      {added === String(p.id) ? <><Check className="mr-2 h-4 w-4" />Added</> : <><ShoppingCart className="mr-2 h-4 w-4" />Add to cart</>}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
