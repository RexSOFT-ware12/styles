import ProductList from "@/components/home/ProductList";

type SearchParams = Record<string, string | string[] | undefined>;

// The "Design Patterns" storefront page — visually and functionally the
// same grid/filter/pagination/cart flow as the homepage's "All Products"
// (same ProductList component, same ProductCard, same checkout + zip
// download flow once purchased). The only difference is the category is
// pinned to "Design Patterns" here, so this page only ever shows the
// SVG-preview items the admin adds from the "Add Design Pattern" dashboard
// page — the backend also excludes this category from the homepage's
// default (unfiltered) product grid, so the two views stay separate.
const DESIGN_PATTERN_CATEGORY = "Design Patterns";

export default async function DesignPatternsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // Keep any other filters/sort/page the visitor set, but always force the
  // category so this page can never be filtered away from Design Patterns.
  const forcedSearchParams: SearchParams = {
    ...resolvedSearchParams,
    category: DESIGN_PATTERN_CATEGORY,
  };

  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
          Design Patterns
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
          Vector pattern artwork, traced to clean SVG from the original
          artwork — each one downloads as a ready-to-use .zip, same as every
          other digital product.
        </p>
      </div>
      <ProductList searchParams={forcedSearchParams} />
    </div>
  );
}
