import Catalog from "@/components/home/Catalog";
import FeaturedProducts, { FeaturedSkeleton } from "@/components/landing/FeaturedProducts";
import Landing from "@/components/landing/Landing";
import { Suspense } from "react";

export const metadata = {
  title: "FabricNow — Trusted by 60,000+ designers | CLO3D Fabrics, Garments & Tools",
  description:
    "Studio-quality CLO3D fabric and garment files, plus Garment Tool, Pose Tool and an API. Instant download, permanent access, 3-day free trial.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const hasQuery = Object.values(sp).some((v) => v !== undefined && v !== "");
  if (hasQuery) return <Catalog searchParams={sp} />;
  return (
    <Landing
      featured={
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      }
    />
  );
}
