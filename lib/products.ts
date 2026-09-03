import fallbackProducts from "@/data/products.json";
import { Product, ProductFilters, ProductsResponse } from "@/types/product";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Fetches the live product catalog from the FabricNow backend — the same
 * data source the admin dashboard writes to. If the backend isn't running
 * (e.g. during static builds, or local dev without the API up), this falls
 * back to the bundled dummy data so the storefront never breaks.
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  try {
    const params = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const res = await fetch(`${API_BASE}/products${params ? `?${params}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const json: ProductsResponse = await res.json();
    return json.data;
  } catch (err) {
    console.warn(
      "FabricNow API unavailable, falling back to bundled sample data:",
      err instanceof Error ? err.message : err
    );
    return fallbackProducts as Product[];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const json = await res.json();
    return json.data as Product;
  } catch (err) {
    console.warn(
      "FabricNow API unavailable, falling back to bundled sample data:",
      err instanceof Error ? err.message : err
    );
    const fallback = (fallbackProducts as Product[]).find(
      (p) => String(p.id) === String(id)
    );
    return fallback || null;
  }
}

export async function getProductMeta(): Promise<{
  categories: string[];
  styles: string[];
  fabrics: string[];
  brands: string[];
}> {
  try {
    const res = await fetch(`${API_BASE}/products/meta`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    return await res.json();
  } catch (err) {
    return { categories: [], styles: [], fabrics: [], brands: [] };
  }
}
