"use client";

import { readRecent, type RecentItem } from "@/lib/recentlyViewed";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Horizontal strip of products this visitor looked at recently (stored in their browser only). */
export default function RecentlyViewed({
  excludeId,
  title = "Recently viewed",
}: {
  excludeId?: number | string;
  title?: string;
}) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(readRecent().filter((p) => String(p.id) !== String(excludeId)).slice(0, 8));
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section aria-label={title} className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      <ul className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((p) => (
          <li key={p.id} className="w-36 shrink-0 sm:w-44">
            <Link href={`/product/${p.id}`} className="group block">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-sm text-muted-foreground">${Number(p.price).toFixed(2)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
