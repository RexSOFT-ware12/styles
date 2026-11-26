import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";
import { SITE_URL } from "@/lib/site";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Rebuilt at most hourly so new products reach Google without a redeploy.
export const revalidate = 3600;

const STATIC = [
  "", "/shop", "/stickers", "/design-patterns", "/pricing", "/developers", "/blog", "/about", "/contact",
  "/help", "/licensing", "/returns", "/press", "/careers", "/request-fabric", "/share-experience",
  "/privacy", "/terms", "/cookies", "/accessibility",
];

async function productEntries(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${API_BASE}/products?limit=100&page=${page}`, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const json = (await res.json()) as { data?: { id: string; updatedAt?: string }[]; pagination?: { pages?: number; totalPages?: number } };
      const rows = json.data || [];
      for (const p of rows) {
        out.push({
          url: `${SITE_URL}/product/${p.id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      const pages = json.pagination?.pages ?? json.pagination?.totalPages ?? 1;
      if (rows.length === 0 || page >= pages) break;
    }
  } catch {
    // Backend unreachable at build time: ship the sitemap without products.
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  return [
    ...STATIC.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: (path === "" || path === "/shop" ? "daily" : "monthly") as "daily" | "monthly",
      priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.5,
    })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...(await productEntries()),
  ];
}
