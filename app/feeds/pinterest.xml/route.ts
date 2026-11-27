import { absoluteUrl, productPinDescription } from "@/lib/pinterest";
import { SITE_URL } from "@/lib/site";
import { assetTypeInfo } from "@/lib/assetTypes";
import type { Product } from "@/types/product";

/**
 * Product feed for Pinterest catalogs (shoppable pins).
 * Add https://www.fabricnow.pro/feeds/pinterest.xml as a data source in
 * Pinterest Business → Catalogs; Pinterest re-reads it every day, so new
 * garments become shoppable pins without any extra work.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const revalidate = 3600;

const isSvg = (src?: string) => !!src && /\.svg(\?|#|$)/i.test(src);

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function allProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await fetch(`${API_BASE}/products?limit=100&page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Products API responded with ${res.status}`);
    const json = (await res.json()) as { data?: Product[]; pagination?: { totalPages?: number; pages?: number } };
    const rows = json.data || [];
    out.push(...rows);
    const pages = json.pagination?.totalPages ?? json.pagination?.pages ?? 1;
    if (!rows.length || page >= pages) break;
  }
  return out;
}

function item(p: Product): string | null {
  const pictures = [p.image, ...(p.heroImages ?? []), ...(p.images ?? []), p.fabricImage]
    .filter((src): src is string => !!src && !isSvg(src))
    .map(absoluteUrl);
  const unique = [...new Set(pictures)];
  if (!unique.length) return null; // Pinterest needs a real photo; skip SVG-only items.

  const onSale = !!p.compareAtPrice && p.compareAtPrice > p.price;
  const price = (onSale ? p.compareAtPrice! : p.price).toFixed(2);
  const description = (p.description?.trim() || productPinDescription(p)).slice(0, 9900);
  const type = [p.assetType && p.assetType !== "garment" ? assetTypeInfo(p.assetType).label : null, p.category, p.style].filter(Boolean).join(" > ");

  return [
    "<item>",
    `<g:id>${esc(p.id)}</g:id>`,
    `<title>${esc(p.name.slice(0, 500))}</title>`,
    `<description>${esc(description)}</description>`,
    `<link>${esc(`${SITE_URL}/product/${p.id}?utm_source=pinterest&utm_medium=catalog`)}</link>`,
    `<g:image_link>${esc(unique[0])}</g:image_link>`,
    unique.length > 1 ? `<g:additional_image_link>${esc(unique.slice(1, 11).join(","))}</g:additional_image_link>` : "",
    `<g:price>${price} USD</g:price>`,
    onSale ? `<g:sale_price>${p.price.toFixed(2)} USD</g:sale_price>` : "",
    `<g:availability>${p.hasDigitalFile ? "in stock" : "out of stock"}</g:availability>`,
    "<g:condition>new</g:condition>",
    `<g:brand>${esc(p.brand || "FabricNow")}</g:brand>`,
    type ? `<g:product_type>${esc(type)}</g:product_type>` : "",
    p.color ? `<g:color>${esc(p.color)}</g:color>` : "",
    p.fabric ? `<g:material>${esc(p.fabric)}</g:material>` : "",
    p.style ? `<g:custom_label_0>${esc(p.style)}</g:custom_label_0>` : "",
    p.featured ? "<g:custom_label_1>featured</g:custom_label_1>" : "",
    "</item>",
  ]
    .filter(Boolean)
    .join("");
}

export async function GET() {
  let products: Product[];
  try {
    products = await allProducts();
  } catch (err) {
    // Better to fail loudly than hand Pinterest an empty feed, which would delist every pin.
    console.error("Pinterest feed: could not load products", err);
    return new Response("Product catalogue is temporarily unavailable.", { status: 503, headers: { "Retry-After": "600" } });
  }

  const items = products.map(item).filter(Boolean).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>FabricNow — CLO3D garment files</title>
<link>${SITE_URL}</link>
<description>Ready-to-use CLO3D .zprj garment and fabric files from FabricNow.</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
