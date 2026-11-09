import Catalog from "@/components/home/Catalog";
import Landing from "@/components/landing/Landing";

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
  // Existing header search / filter / pagination links point at "/?search=…",
  // so any query string keeps showing the catalog. A bare "/" is the landing page.
  const hasQuery = Object.values(sp).some((v) => v !== undefined && v !== "");
  return hasQuery ? <Catalog searchParams={sp} /> : <Landing />;
}
