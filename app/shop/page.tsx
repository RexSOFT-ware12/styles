import Catalog from "@/components/home/Catalog";
import { assetTypeInfo, isAssetType } from "@/lib/assetTypes";
import type { Metadata } from "next";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const raw = (await searchParams).type;
  const type = Array.isArray(raw) ? raw[0] : raw;
  if (isAssetType(type)) {
    const info = assetTypeInfo(type);
    return { title: `${info.heading} — FabricNow`, description: info.blurb };
  }
  return {
    title: "Shop CLO3D Fabrics & Garments — FabricNow",
    description: "Browse CLO3D garments, fabrics, trims, poses, render presets and starter blocks, ready to download.",
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  return <Catalog searchParams={await searchParams} />;
}
