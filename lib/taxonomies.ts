const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Taxonomies {
  categories: string[];
  styles: string[];
  fabrics: string[];
}

/**
 * Fetches the live category/style/fabric taxonomy — the same values used
 * to filter the storefront's product grid. Used by /welcome to offer real
 * style choices instead of a hardcoded, possibly-stale list.
 */
export async function fetchTaxonomies(): Promise<Taxonomies> {
  const res = await fetch(`${API_BASE}/taxonomies`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed with ${res.status}`);
  return res.json();
}
