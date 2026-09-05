import ProductList from "@/components/home/ProductList";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
          CLO3D-Ready Fabrics &amp; Garments
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
          Studio-quality fabric assets and ready-to-use 3D garment files —
          download a CLO3D project, drop it in, and start designing in
          minutes.
        </p>
      </div>
      <ProductList searchParams={resolvedSearchParams} />
    </div>
  );
}
