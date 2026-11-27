import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/product";
import Link from "next/link";
import { assetTypeInfo } from "@/lib/assetTypes";

function formatSize(bytes?: number) {
  if (typeof bytes !== "number" || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "What you get" — plain facts about the download so buyers know what they're paying for. */
export default function ProductSpecs({ product }: { product: Product }) {
  const file = product.digitalFile;
  const ext = file?.originalName?.split(".").pop()?.toLowerCase();
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Delivery", value: "Instant download as soon as payment succeeds" },
    { label: "File", value: file ? `${file.originalName}${ext ? ` (.${ext})` : ""}` : "Digital download" },
  ];
  const size = formatSize(file?.size);
  if (size) rows.push({ label: "Size", value: size });
  const type = assetTypeInfo(product.assetType);
  if (product.assetType && product.assetType !== "garment" && product.assetType !== "addon") rows.push({ label: "Type", value: type.badge });
  rows.push({ label: "Works with", value: type.worksWith });
  if (product.gradedSizes?.length) rows.push({ label: "Sizes", value: `Graded: ${product.gradedSizes.join(", ")}` });
  if (product.colorways?.length) rows.push({ label: "Colourways", value: product.colorways.map((c) => c.name).join(", ") });
  if (product.fabric) rows.push({ label: "Fabric", value: product.fabric });
  if (product.style) rows.push({ label: "Style", value: product.style });
  if (product.sku) rows.push({ label: "SKU", value: product.sku });
  rows.push({ label: "Re-downloads", value: "Free, any time, from your account" });
  rows.push({
    label: "Licence",
    value: (
      <>
        Use in your own designs — <Link href="/licensing" className="text-primary underline underline-offset-2">read the licence</Link>
      </>
    ),
  });

  return (
    <Card className="mb-10">
      <CardContent className="p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">What you get</h2>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 border-b border-border/60 pb-3 text-sm">
              <dt className="w-28 shrink-0 text-muted-foreground">{r.label}</dt>
              <dd className="min-w-0 break-words font-medium text-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
