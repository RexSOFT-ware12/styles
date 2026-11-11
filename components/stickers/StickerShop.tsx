"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Check, FileImage, Layers, Package, Ruler, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GARMENT_COLORS,
  GARMENT_LABEL,
  PLACEMENTS,
  STICKERS,
  type Garment,
  type Sticker,
} from "./stickerData";

type Filter = "all" | Garment | "packs";
type Sort = "featured" | "price_asc" | "price_desc";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shirt", label: "T-shirts" },
  { id: "shorts", label: "Shorts" },
  { id: "hoodie", label: "Hoodies" },
  { id: "packs", label: "Packs" },
];

/* ------------------------------------------------------------------ */
/* Garment mockup                                                      */
/* ------------------------------------------------------------------ */

function GarmentShape({ garment, fill, stroke }: { garment: Garment; fill: string; stroke: string }) {
  const common = { fill, stroke, strokeWidth: 2.5, strokeLinejoin: "round" as const };
  if (garment === "shirt") {
    return (
      <g>
        <path d="M95 40 60 54 22 104l34 24 24-20v152h140V108l24 20 34-24-38-50-35-14q-55 32-110 0Z" {...common} />
        <path d="M95 40q55 34 110 0" fill="none" stroke={stroke} strokeWidth={2.5} opacity={0.55} />
      </g>
    );
  }
  if (garment === "shorts") {
    return (
      <g>
        <path d="M78 44h144l22 196h-92l-4-110-4 110H56Z" {...common} />
        <path d="M78 44h144v22H78Z" fill={fill} stroke={stroke} strokeWidth={2.5} />
        <path d="M150 66v64" stroke={stroke} strokeWidth={2} opacity={0.5} />
        <path d="M120 66v20M180 66v20" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      </g>
    );
  }
  return (
    <g>
      <path d="M100 40q50 40 100 0l16-12q22 6 26 28l32 134-38 12-22-70v146H86V164l-22 70-38-12 32-134q4-22 26-28Z" {...common} />
      <path d="M100 40q50 44 100 0" fill="none" stroke={stroke} strokeWidth={2.5} opacity={0.55} />
      <path d="M112 232h76l8 30h-92Z" fill="none" stroke={stroke} strokeWidth={2} opacity={0.4} />
      <path d="M134 44v38M166 44v38" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    </g>
  );
}

function TryOn({ sticker }: { sticker: Sticker }) {
  const available = sticker.garments;
  const [garmentPick, setGarmentPick] = useState<Garment>("shirt");
  const garment: Garment = available.includes(garmentPick) ? garmentPick : available[0];
  const [colorIdx, setColorIdx] = useState(1);
  const [placementId, setPlacementId] = useState<Record<Garment, string>>({ shirt: "chest", shorts: "left", hoodie: "chest" });
  const [scale, setScale] = useState(1);

  const placements = PLACEMENTS[garment];
  const placement = placements.find((p) => p.id === placementId[garment]) ?? placements[0];
  const color = GARMENT_COLORS[colorIdx];
  const dark = ["Black", "Forest", "Navy", "Brick"].includes(color.name);
  const size = placement.size * scale;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label={`${sticker.name} placed on a ${GARMENT_LABEL[garment]}`}>
          <ellipse cx="150" cy="276" rx="92" ry="9" fill="#000" opacity="0.08" />
          <GarmentShape garment={garment} fill={color.value} stroke={dark ? "#00000066" : "#57534e66"} />
          <image
            href={sticker.image}
            x={placement.x - size / 2}
            y={placement.y - size / 2}
            width={size}
            height={size}
            style={{ transition: "all 250ms ease" }}
          />
        </svg>
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
          {GARMENT_LABEL[garment]} · {color.name}
        </span>
      </div>

      <div className="grid gap-3 text-sm">
        <div role="group" aria-label="Garment" className="flex flex-wrap gap-2">
          {(["shirt", "shorts", "hoodie"] as Garment[]).map((g) => {
            const ok = available.includes(g);
            return (
              <button
                key={g}
                type="button"
                disabled={!ok}
                aria-pressed={garment === g}
                onClick={() => setGarmentPick(g)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
                  garment === g ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-accent"
                )}
              >
                {GARMENT_LABEL[g]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div role="group" aria-label="Garment colour" className="flex items-center gap-1.5">
            {GARMENT_COLORS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={colorIdx === i}
                onClick={() => setColorIdx(i)}
                className={cn(
                  "h-7 w-7 rounded-full border border-black/15 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  colorIdx === i && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                style={{ background: c.value }}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
            Size
            <input
              id="sticker-scale"
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-28 accent-[var(--primary)]"
            />
          </label>
        </div>

        <div role="group" aria-label="Placement" className="flex flex-wrap gap-2">
          {placements.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={placement.id === p.id}
              onClick={() => setPlacementId((prev) => ({ ...prev, [garment]: p.id }))}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                placement.id === p.id ? "border-foreground bg-foreground text-background" : "border-input bg-background hover:bg-accent"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function StickerCard({ sticker, selected, onPreview }: { sticker: Sticker; selected: boolean; onPreview: () => void }) {
  const { addToCart, cart } = useCart();
  const inCart = cart.some((i) => i.id === sticker.id);
  const [flash, setFlash] = useState(false);

  const add = () => {
    addToCart({ id: sticker.id, name: sticker.name, price: sticker.price, image: sticker.image });
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  };

  return (
    <Card className={cn("group flex flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", selected && "ring-2 ring-primary")}>
      <button
        type="button"
        onClick={onPreview}
        disabled={sticker.isPack}
        aria-label={sticker.isPack ? sticker.name : `Preview ${sticker.name} on a garment`}
        className="relative block aspect-square w-full overflow-hidden bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] [background-size:20px_20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sticker.image} alt={sticker.name} className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105" />
        {sticker.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-md">
            {sticker.badge}
          </span>
        )}
        {!sticker.isPack && (
          <span className="absolute inset-x-0 bottom-0 hidden bg-background/85 py-1.5 text-center text-[11px] font-semibold backdrop-blur-sm group-hover:block">
            Try on a garment
          </span>
        )}
      </button>

      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-foreground"><Link href={`/stickers/${sticker.id}`} className="hover:underline">{sticker.name}</Link></h3>
          <span className="shrink-0 text-sm font-bold tabular-nums">${sticker.price.toFixed(2)}</span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{sticker.blurb}</p>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{sticker.style}</span>
          {sticker.isPack && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{sticker.count} designs</span>}
          {sticker.garments.map((g) => (
            <span key={g} className="hidden rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              {GARMENT_LABEL[g]}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          onClick={add}
          disabled={inCart && !flash}
          className={cn("mt-auto w-full", flash && "bg-green-600 text-white hover:bg-green-600")}
        >
          {flash ? (
            <>
              <Check /> Added
            </>
          ) : inCart ? (
            "In your cart"
          ) : (
            <>
              <ShoppingCart /> Add to cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StickerShop() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const singles = useMemo(() => STICKERS.filter((s) => !s.isPack), []);
  const [previewId, setPreviewId] = useState(singles[0].id);
  const preview = singles.find((s) => s.id === previewId) ?? singles[0];

  const visible = useMemo(() => {
    let list = STICKERS.filter((s) => {
      if (filter === "all") return true;
      if (filter === "packs") return !!s.isPack;
      return s.garments.includes(filter);
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filter, sort]);

  const packs = STICKERS.filter((s) => s.isPack);

  return (
    <div>
      {/* Hero + try-on */}
      <section className="border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="container mx-auto grid items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-16">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-4">
              Garment stickers
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Stick it on the shirt. <span className="text-primary">See it before you buy.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Die-cut graphics made for shirts, shorts and hoodies. Pick a design, choose a garment and colour, move it around, then add it to your cart. Singles from $2.99, packs for less per sticker.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#catalog">Browse stickers</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#packs">See packs</a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/custom-sticker">Create a custom sticker</Link>
              </Button>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previewing</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a sticker to preview">
                {singles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreviewId(s.id)}
                    aria-pressed={s.id === preview.id}
                    aria-label={s.name}
                    title={s.name}
                    className={cn(
                      "h-12 w-12 rounded-xl border bg-card p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      s.id === preview.id ? "border-primary shadow-md ring-2 ring-primary" : "border-border hover:-translate-y-0.5"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {preview.name} <span className="font-normal text-muted-foreground">· ${preview.price.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-md sm:p-5">
            <TryOn key={preview.id} sticker={preview} />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="container mx-auto scroll-mt-24 px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All stickers</h2>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {visible.length} {visible.length === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Filter by garment" className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    filter === f.id ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label htmlFor="sticker-sort" className="sr-only">
              Sort stickers
            </label>
            <select
              id="sticker-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((s) => (
            <StickerCard
              key={s.id}
              sticker={s}
              selected={!s.isPack && s.id === preview.id}
              onPreview={() => {
                setPreviewId(s.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </section>

      {/* Packs */}
      <section id="packs" className="scroll-mt-24 border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Packs</h2>
          <p className="mt-1 text-sm text-muted-foreground">Buying more than two? A pack costs less per sticker.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {packs.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="h-24 w-24 shrink-0 rounded-xl bg-muted object-contain p-1" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.count} designs · ${(p.price / p.count).toFixed(2)} each
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums">${p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="container mx-auto px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">What you get</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileImage, title: "Vector files", text: "Each sticker downloads as a scalable SVG with its die-cut border included." },
            { icon: Layers, title: "Ready for your tools", text: "Drop the artwork on a garment in CLO3D or any design app as a decal." },
            { icon: Package, title: "Instant delivery", text: "Pay once and the download unlocks. Re-download any time from My Purchases." },
            { icon: ShieldCheck, title: "Clear licence", text: "Use them on garments you make. Read the full terms on the licensing page." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Questions about sizing or printing? See the{" "}
          <Link href="/help" className="font-medium text-primary underline-offset-4 hover:underline">
            Help Center
          </Link>{" "}
          or{" "}
          <Link href="/licensing" className="font-medium text-primary underline-offset-4 hover:underline">
            licensing
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
