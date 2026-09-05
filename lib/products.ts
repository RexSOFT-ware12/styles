import { Product, ProductFilters, ProductReview, ProductsResponse } from "@/types/product";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface ProductsResult {
  products: Product[];
  pagination: ProductsResponse["pagination"] | null;
  /** True when the backend couldn't be reached / errored — as opposed to a
   *  successful response that simply matched zero products. Callers should
   *  show a distinct "couldn't load, try again" state for this. */
  error: boolean;
}

/**
 * Fetches the live product catalog from the FabricNow backend — the same
 * data source the admin dashboard writes to. There is no dummy/sample data
 * fallback: if the backend is unreachable, `error: true` is set (and the
 * real error is logged) so callers can tell that apart from a genuine
 * zero-result search.
 */
export async function getProductsWithStatus(
  filters: ProductFilters = {}
): Promise<ProductsResult> {
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
    return { products: json.data, pagination: json.pagination, error: false };
  } catch (err) {
    console.error(
      "FabricNow API unavailable — could not load products:",
      err instanceof Error ? err.message : err
    );
    return { products: [], pagination: null, error: true };
  }
}

/**
 * Convenience wrapper for callers that just want the list and don't need to
 * distinguish "backend error" from "no results" (e.g. a related-products
 * widget, where either case just means "show nothing").
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  const { products } = await getProductsWithStatus(filters);
  return products;
}

export interface ProductResult {
  product: Product | null;
  /** True when the backend errored/was unreachable — as opposed to a clean
   *  404 (genuinely no such product). Callers should offer a "try again"
   *  action for this case rather than a flat "not found". */
  error: boolean;
}

export async function getProductByIdWithStatus(
  id: string | number
): Promise<ProductResult> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
    if (res.status === 404) return { product: null, error: false };
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const json = await res.json();
    return { product: json.data as Product, error: false };
  } catch (err) {
    console.error(
      "FabricNow API unavailable — could not load product:",
      err instanceof Error ? err.message : err
    );
    return { product: null, error: true };
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  const { product } = await getProductByIdWithStatus(id);
  return product;
}

export interface FiboChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface FiboSuggestion {
  id: string | number;
  name: string;
  price: number;
  image: string;
  fabric?: string;
  color?: string;
  style?: string;
}

export interface FiboAskResponse {
  reply: string;
  suggestions: FiboSuggestion[];
}

/**
 * Asks Fibo (the Gemini-powered fabric assistant) a question about a
 * specific product, grounded in that product's data and the live catalog.
 */
export async function askFibo(
  productId: string | number,
  message: string,
  history: FiboChatTurn[] = []
): Promise<FiboAskResponse> {
  const res = await fetch(`${API_BASE}/assistant/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, message, history }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.error || `Fibo API responded with ${res.status}`);
  }

  return {
    reply: json.reply as string,
    suggestions: (json.suggestions as FiboSuggestion[]) || [],
  };
}

/**
 * Asks Fibo Live Chat (the Gemini-powered, site-wide assistant) a question
 * about FabricNow's application as a whole — not scoped to one product.
 */
export async function askSiteChat(
  message: string,
  history: FiboChatTurn[] = []
): Promise<string> {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.error || `Live chat API responded with ${res.status}`);
  }

  return json.reply as string;
}

export async function submitProductReview(
  productId: string | number,
  token: string,
  payload: { rating: number; comment: string }
): Promise<ProductReview> {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Review API responded with ${res.status}`);
  return json.data as ProductReview;
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
  } catch {
    return { categories: [], styles: [], fabrics: [], brands: [] };
  }
}
