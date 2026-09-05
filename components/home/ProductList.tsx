import { getProductMeta, getProductsWithStatus } from "@/lib/products";
import type { ProductFilters } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductFilterBar from "./ProductFilterBar";
import ProductPagination from "./ProductPagination";

const PAGE_SIZE = 24;

const SORT_VALUES = new Set(["price_asc", "price_desc", "newest", "name_asc"]);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Builds a typed ProductFilters object from raw Next.js searchParams. */
function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): { filters: ProductFilters; page: number } {
  const search = first(searchParams.search)?.trim();
  const category = first(searchParams.category);
  const style = first(searchParams.style);
  const fabric = first(searchParams.fabric);
  const brand = first(searchParams.brand);
  const minPriceRaw = first(searchParams.minPrice);
  const maxPriceRaw = first(searchParams.maxPrice);
  const sortRaw = first(searchParams.sort);
  const pageRaw = first(searchParams.page);
  const featuredRaw = first(searchParams.featured);

  const page = Math.max(1, Number(pageRaw) || 1);
  const minPrice = minPriceRaw !== undefined ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw !== undefined ? Number(maxPriceRaw) : undefined;
  const featured = featuredRaw === "true" || featuredRaw === "1" ? true : undefined;

  const filters: ProductFilters = {
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(style ? { style } : {}),
    ...(fabric ? { fabric } : {}),
    ...(brand ? { brand } : {}),
    ...(minPrice !== undefined && !Number.isNaN(minPrice) ? { minPrice } : {}),
    ...(maxPrice !== undefined && !Number.isNaN(maxPrice) ? { maxPrice } : {}),
    ...(featured ? { featured } : {}),
    sort:
      sortRaw && SORT_VALUES.has(sortRaw)
        ? (sortRaw as ProductFilters["sort"])
        : "newest",
    page,
    limit: PAGE_SIZE,
  };

  return { filters, page };
}

export default async function ProductList({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { filters, page } = parseFilters(searchParams);

  const [meta, result] = await Promise.all([
    getProductMeta(),
    getProductsWithStatus(filters),
  ]);

  const { products, pagination, error } = result;
  const hasAnyFilter = Boolean(
    filters.search || filters.category || filters.style || filters.fabric || filters.brand || filters.minPrice || filters.maxPrice || filters.featured
  );

  return (
    <div>
      <ProductFilterBar meta={meta} />

      {filters.search && (
        <p className="max-w-7xl mx-auto mb-4 text-sm text-muted-foreground">
          Showing results for <span className="font-medium text-foreground">&quot;{filters.search}&quot;</span>
        </p>
      )}

      {filters.featured && !filters.search && (
        <p className="max-w-7xl mx-auto mb-4 text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">Featured</span> products
        </p>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-7xl mx-auto">
        {error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Couldn&apos;t load products
            </h3>
            <p className="text-muted-foreground mb-4">
              Something went wrong reaching the catalog. Please try again.
            </p>
            <a
              href="?"
              className="text-sm font-medium text-primary hover:underline"
            >
              Try again
            </a>
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasAnyFilter
                ? "Try adjusting your filters or search terms"
                : "Check back soon — new products are on the way"}
            </p>
          </div>
        )}
      </div>

      {!error && pagination && (
        <ProductPagination page={page} totalPages={pagination.totalPages} />
      )}
    </div>
  );
}
