"use client";

import type { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Dropdown of the top matches while typing in the header search box. */
export default function SearchSuggestions({ query, onPick }: { query: string; onPick: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=5`, { signal: ctrl.signal });
        if (!res.ok) return;
        setItems((await res.json()).data ?? []);
      } catch {
        /* aborted or offline — keep the last list */
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (q.length < 2 || items.length === 0) return null;

  return (
    <ul role="listbox" className="absolute right-0 top-full z-50 mt-2 w-[24rem] max-w-[90vw] overflow-hidden rounded-xl border bg-background shadow-xl">
      {items.map((p) => (
        <li key={p.id} role="option" aria-selected="false">
          <Link href={`/product/${p.id}`} onClick={onPick} className="flex items-center gap-3 px-3 py-2 hover:bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-md bg-muted object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{[p.fabric, p.style].filter(Boolean).join(" · ") || p.category}</span>
            </span>
            <span className="text-sm font-semibold text-foreground">${p.price.toFixed(2)}</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={`/?search=${encodeURIComponent(q)}`} onClick={onPick} className="block border-t px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted">
          See all results for “{q}”
        </Link>
      </li>
    </ul>
  );
}
