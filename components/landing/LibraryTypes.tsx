import { ASSET_TYPES } from "@/lib/assetTypes";
import { Aperture, ArrowRight, CircleDot, Layers, PersonStanding, Ruler, Shirt, type LucideIcon } from "lucide-react";
import Link from "next/link";

const ICONS: Record<string, LucideIcon> = {
  garment: Shirt,
  fabric: Layers,
  trim: CircleDot,
  pose: PersonStanding,
  render: Aperture,
  block: Ruler,
};

/** Homepage tiles for every kind of CLO3D file the shop sells. */
export default function LibraryTypes() {
  return (
    <section className="px-4 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Beyond garments</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Everything your CLO3D project needs</h2>
          <p className="mt-3 text-muted-foreground">Fabrics, trims, poses, render presets and starter blocks, ready to drop into any project.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSET_TYPES.map((t) => {
            const Icon = ICONS[t.type] || Shirt;
            return (
              <Link
                key={t.type}
                href={`/shop?type=${t.type}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-60" aria-hidden />
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{t.formats}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
