import Catalog from "@/components/home/Catalog";

export const metadata = {
  title: "Shop CLO3D Fabrics & Garments — FabricNow",
  description: "Browse studio-quality fabric assets and ready-to-use CLO3D garment files.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Catalog searchParams={await searchParams} />;
}
