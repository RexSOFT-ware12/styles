export interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  sku?: string;
  stock?: number;
  category?: string;
  brand?: string;
  /** Fashion style, e.g. "Streetwear", "Athletic", "Retro". Shown as a badge. */
  style?: string;
  /** Material/fabric, e.g. "Leather", "Mesh", "Cotton". Shown as a badge. */
  fabric?: string;
  color?: string;
  size?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
  page?: number;
  limit?: number;
}
