import AssetTypeTabs from "@/components/home/AssetTypeTabs";
import ProductList from "@/components/home/ProductList";
import { assetTypeInfo, isAssetType } from "@/lib/assetTypes";

type SearchParams = Record<string, string | string[] | undefined>;

/** The product catalog (previously the whole homepage). Used by /shop and by / when filters/search are present. */
export default function Catalog({ searchParams }: { searchParams: SearchParams }) {
  const raw = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type;
  const type = isAssetType(raw) ? raw : undefined;
  const info = type ? assetTypeInfo(type) : null;

  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-10 space-y-3">
        <h1 className="text-primary text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
          {info ? info.heading : <>CLO3D-Ready Fabrics &amp; Garments</>}
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
          {info
            ? info.blurb
            : "Garments, fabrics, trims, poses, render presets and starter blocks: everything you need in CLO3D, ready to download."}
        </p>
      </div>
      <AssetTypeTabs active={type} />
      <ProductList searchParams={searchParams} />
    </div>
  );
}
