export interface ProductReview {
  _id?: string;
  userId?: string;
  reviewerName: string;
  /** 1–5, generated reviews are always kept within 4.0–4.9. */
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  /** Hero shot — the fabric made up / worn on an AI model (first of heroImages, for backward compat). */
  image: string;
  /** Full set of "on model" hero shots (1 or more) — auto-swipe together on the product page. */
  heroImages?: string[];
  /** Close-up of the fabric swatch/texture itself. */
  fabricImage?: string;
  /** Gallery of additional on-model shots — same garment, different angles/styles. */
  images?: string[];
  description?: string;
  sku?: string;
  category?: string;
  brand?: string;
  /** Fashion style, e.g. "Streetwear", "Athletic", "Retro". Shown as a badge. */
  style?: string;
  /** Material/fabric, e.g. "Leather", "Mesh", "Cotton". Shown as a badge. */
  fabric?: string;
  color?: string;
  size?: string;
  /** Link to this product's Pin on Pinterest. When set, a Pinterest icon appears on the product page. */
  pinterestUrl?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Whether a downloadable digital bundle (.zip with the .zprj + assets) is attached. */
  hasDigitalFile?: boolean;
  digitalFile?: { originalName: string; size: number } | null;
  /** Auto-generated customer reviews (4.0–4.9 stars), newest first. */
  reviews?: ProductReview[];
  /** Average of `reviews[].rating`, rounded to 1 decimal. Null if no reviews. */
  rating?: number | null;
  reviewCount?: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  style?: string;
  fabric?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
  page?: number;
  limit?: number;
}
