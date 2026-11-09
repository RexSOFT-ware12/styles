import ProductCardSkeleton from "@/components/home/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="text-primary text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
          CLO3D-Ready Fabrics &amp; Garments
        </h1>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-7xl mx-auto">
        {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
