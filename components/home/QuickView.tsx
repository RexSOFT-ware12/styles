"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface QuickViewProduct {
  id: number | string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  style?: string;
  fabric?: string;
  category?: string;
  hasDigitalFile?: boolean;
}

export default function QuickView({ product, onClose }: { product: QuickViewProduct; onClose: () => void }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative grid max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-background shadow-2xl sm:max-w-3xl sm:grid-cols-2 sm:rounded-2xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 shadow hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="aspect-square w-full bg-muted object-cover" />
        <div className="flex flex-col gap-4 p-6">
          <h2 className="pr-8 text-2xl font-bold text-foreground">{product.name}</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {product.style && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{product.style}</span>}
            {product.fabric && <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">{product.fabric}</span>}
            {product.category && <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">{product.category}</span>}
          </div>
          <p className="text-3xl font-bold text-foreground">
            ${product.price.toFixed(2)}
            {onSale && (
              <span className="ml-3 text-lg font-normal text-muted-foreground line-through">${product.compareAtPrice!.toFixed(2)}</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">Instant download. Free re-downloads from your account.</p>
          <div className="mt-auto flex flex-col gap-2">
            <Button
              size="lg"
              disabled={!product.hasDigitalFile}
              onClick={() => {
                addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
            >
              {added ? <><Check className="mr-2 h-4 w-4" />Added to cart</> : <><ShoppingCart className="mr-2 h-4 w-4" />{product.hasDigitalFile ? "Add to cart" : "Unavailable"}</>}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/product/${product.id}`} onClick={onClose}>View full details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
