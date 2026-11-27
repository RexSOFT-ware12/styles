import { assetTypeInfo } from "@/lib/assetTypes";
import type { Product } from "@/types/product";
import { Box, ExternalLink, Palette, Ruler } from "lucide-react";

/** Only CLO-SET links are ever turned into a button. */
export function safeClosetUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)clo-set\.com$/i.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * CLO3D extras on the product page: file type, 3D preview on CLO-SET,
 * graded sizes and the colourways saved in the project.
 */
export default function CloExtras({ product }: { product: Product }) {
  const closet = safeClosetUrl(product.closetUrl);
  const sizes = product.gradedSizes ?? [];
  const colorways = product.colorways ?? [];
  const type = product.assetType && product.assetType !== "addon" ? assetTypeInfo(product.assetType) : null;

  if (!closet && !sizes.length && !colorways.length && (!type || type.type === "garment")) return null;

  return (
    <div className="space-y-4">
      {type && type.type !== "garment" && (
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm">
          <span className="font-semibold text-primary">{type.badge}</span>
          <span className="text-muted-foreground">· {type.formats}</span>
        </div>
      )}

      {closet && (
        <a
          href={closet}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-border bg-gradient-to-r from-primary/10 via-transparent to-transparent p-4 transition-colors hover:border-primary/50"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Box className="h-5 w-5 motion-safe:group-hover:animate-spin" style={{ animationDuration: "3s" }} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-foreground">View in 3D on CLO-SET</span>
            <span className="block text-sm text-muted-foreground">Spin, zoom and check the fit in your browser before you buy.</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </a>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Ruler className="h-4 w-4 text-primary" /> Graded sizes included
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span key={s} className="min-w-[44px] rounded-lg border border-border bg-card px-3 py-1.5 text-center text-sm font-semibold">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Every size is graded in the project, ready for production.</p>
        </div>
      )}

      {colorways.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Palette className="h-4 w-4 text-primary" /> {colorways.length} colourway{colorways.length === 1 ? "" : "s"} included
          </div>
          <div className="flex flex-wrap gap-2">
            {colorways.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm">
                <span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: c.hex || "#9ca3af" }} aria-hidden />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
