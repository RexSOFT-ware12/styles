"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { STICKERS } from "@/components/stickers/stickerData";

export default function StickerDetailClient({ id }: { id: string }) {
  const sticker = useMemo(() => STICKERS.find((item) => item.id === id), [id]);
  const related = useMemo(
    () => STICKERS.filter((item) => item.id !== id && item.garments.some((g) => sticker?.garments.includes(g))).slice(0, 4),
    [id, sticker]
  );
  const { addToCart, cart } = useCart();

  if (!sticker) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Sticker not found</h1>
        <p className="mt-3 text-muted-foreground">This design may have moved or is no longer available.</p>
        <Button asChild className="mt-6"><Link href="/stickers">Back to stickers</Link></Button>
      </main>
    );
  }

  const inCart = cart.some((item) => item.id === sticker.id);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/stickers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All stickers
      </Link>
      <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="rounded-3xl border border-border bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] [background-size:24px_24px] p-8 sm:p-12">
          <Image src={sticker.image} alt={sticker.name} width={720} height={720} priority className="mx-auto aspect-square w-full max-w-xl object-contain" unoptimized />
        </div>
        <div className="py-2">
          <Badge variant="secondary">{sticker.style}{sticker.isPack ? " · Bundle" : " · Digital sticker"}</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{sticker.name}</h1>
          <p className="mt-4 text-2xl font-bold tabular-nums">${sticker.price.toFixed(2)}</p>
          <p className="mt-4 leading-7 text-muted-foreground">{sticker.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {sticker.garments.map((garment) => <span key={garment} className="rounded-full bg-muted px-3 py-1 text-sm capitalize">{garment === "shirt" ? "T-shirt" : garment}</span>)}
            {sticker.isPack && <span className="rounded-full bg-muted px-3 py-1 text-sm">{sticker.count} designs</span>}
          </div>
          <div className="mt-8 rounded-2xl border border-border p-5">
            <h2 className="font-semibold">Included with your purchase</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Scalable SVG artwork</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Transparent PNG export</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Download access in My Purchases after payment</li>
            </ul>
          </div>
          <Button className="mt-6 w-full sm:w-auto" disabled={inCart} onClick={() => addToCart({ id: sticker.id, name: sticker.name, price: sticker.price, image: sticker.image })}>
            <ShoppingCart className="mr-2 h-4 w-4" /> {inCart ? "Already in your cart" : "Add to cart"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">Digital product. No physical item will be shipped.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} href={`/stickers/${item.id}`} className="group rounded-2xl border border-border p-3 transition hover:-translate-y-1 hover:shadow-md">
                <Image src={item.image} alt={item.name} width={320} height={320} className="aspect-square w-full object-contain" unoptimized />
                <p className="mt-2 text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
