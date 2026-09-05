"use client";

import { Badge } from "@/components/ui/badge";
import { cn, isSvgSrc, makeSvgResponsive, recolorPatternSvg } from "@/lib/utils";
import { Check, Loader2, Palette } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface GalleryImage {
  src: string;
  label?: string;
}

const AUTOPLAY_INTERVAL_MS = 3500;

// Preset colorways offered for a traced Design Pattern's single flat fill
// color (see style-backend/src/lib/svgConvert.js + lib/utils.ts's
// recolorPatternSvg). `value: null` means "show the pattern's original
// color" rather than overriding it.
const PATTERN_COLORS: { label: string; value: string | null }[] = [
  { label: "Original", value: null },
  { label: "Charcoal", value: "#1f2937" },
  { label: "Crimson", value: "#b91c1c" },
  { label: "Rust", value: "#c2410c" },
  { label: "Amber", value: "#b45309" },
  { label: "Olive", value: "#4d7c0f" },
  { label: "Forest", value: "#166534" },
  { label: "Teal", value: "#0f766e" },
  { label: "Navy", value: "#1e3a8a" },
  { label: "Violet", value: "#6d28d9" },
  { label: "Plum", value: "#9d174d" },
];

export default function ProductGallery({
  name,
  image,
  heroImages,
  fabricImage,
  images,
}: {
  name: string;
  image: string;
  heroImages?: string[];
  fabricImage?: string;
  images?: string[];
}) {
  // The auto-swiping deck: every "on model" hero shot (1 or more), plus the
  // fabric close-up tacked on at the end. These all fill their frame
  // edge-to-edge (object-cover) and cycle automatically.
  const heroSet = heroImages && heroImages.length ? heroImages : [image];
  const mainDeck = useMemo<GalleryImage[]>(() => {
    const hero = heroSet.map((src) => ({ src, label: "On Model" }));
    return fabricImage ? [...hero, { src: fabricImage, label: "Fabric" }] : hero;
  }, [heroSet.join("|"), fabricImage]);

  // The alternate-model gallery is manual-only — click to view, never
  // auto-cycled, and shown in full (object-contain) rather than cropped.
  const subGallery = useMemo<GalleryImage[]>(() => {
    return (images || [])
      .filter((src) => src && !heroSet.includes(src) && src !== fabricImage)
      .map((src) => ({ src, label: "Model" }));
  }, [images?.join("|"), heroSet.join("|"), fabricImage]);

  const gallery = useMemo<GalleryImage[]>(
    () => [...mainDeck, ...subGallery],
    [mainDeck, subGallery]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayStopped, setAutoplayStopped] = useState(false);
  const [hovering, setHovering] = useState(false);

  // What's actually painted in the big frame right now. This can lag one
  // step behind `activeIndex` while the newly-picked image is still
  // downloading — we keep showing the last-loaded shot (with a spinner on
  // top) instead of leaving a blank frame, then swap the instant it's ready.
  const [displayed, setDisplayed] = useState<GalleryImage>(gallery[0]);
  const [isSwitching, setIsSwitching] = useState(false);
  const loadedSrcs = useRef<Set<string>>(new Set());

  const active = gallery[activeIndex] || gallery[0];

  // Cycle through just the main deck (hero shots + fabric close-up) —
  // never auto-advances into the manual sub-gallery. Stops for good once
  // the shopper manually picks a thumbnail, and pauses (without stopping)
  // while hovering.
  useEffect(() => {
    if (autoplayStopped || hovering || mainDeck.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mainDeck.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoplayStopped, hovering, mainDeck.length]);

  // Preload every gallery image into the browser cache in the background as
  // soon as the gallery is known, so most thumbnail clicks resolve instantly
  // (no spinner) — the spinner only shows up for a shot that genuinely
  // hasn't finished downloading yet.
  useEffect(() => {
    gallery.forEach((img) => {
      if (!img?.src || loadedSrcs.current.has(img.src)) return;
      const preloadEl = new window.Image();
      preloadEl.src = img.src;
      preloadEl.onload = () => loadedSrcs.current.add(img.src);
    });
  }, [gallery]);

  // Whenever the selected image changes, only swap the big frame over once
  // the image data has actually arrived — show a quick spinner on top of
  // the still-visible current image in the meantime instead of a blank gap.
  useEffect(() => {
    if (!active) return;
    if (active.src === displayed.src) {
      setIsSwitching(false);
      return;
    }
    if (loadedSrcs.current.has(active.src)) {
      setDisplayed(active);
      setIsSwitching(false);
      return;
    }

    let cancelled = false;
    setIsSwitching(true);

    const img = new window.Image();
    img.src = active.src;
    const finish = () => {
      if (cancelled) return;
      loadedSrcs.current.add(active.src);
      setDisplayed(active);
      setIsSwitching(false);
    };
    if (img.complete) {
      finish();
    } else {
      img.onload = finish;
      img.onerror = finish; // still swap so the broken-image state shows, rather than spinning forever
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.src]);

  const selectImage = (index: number) => {
    setActiveIndex(index);
    setAutoplayStopped(true);
  };

  // --- Design Pattern recoloring -------------------------------------
  // For a traced Design Pattern SVG (see isSvgSrc), fetch its raw markup so
  // it can be shown inline (dangerouslySetInnerHTML) rather than as an
  // opaque <img> — inline is what lets the swatch picker below actually
  // retint it, since every shape in the trace shares one flat fill color
  // (see recolorPatternSvg's doc comment for why that's safe to swap).
  const [patternMarkup, setPatternMarkup] = useState<string | null>(null);
  const [patternColor, setPatternColor] = useState<string | null>(null);

  useEffect(() => {
    setPatternColor(null); // reset to "Original" whenever the shown image changes
    if (!isSvgSrc(displayed.src)) {
      setPatternMarkup(null);
      return;
    }
    let cancelled = false;
    fetch(displayed.src)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((text) => {
        if (!cancelled) setPatternMarkup(text);
      })
      .catch(() => {
        // Fall back to the plain <img> render below — still shows the
        // pattern, just without the color picker.
        if (!cancelled) setPatternMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [displayed.src]);

  const recoloredMarkup = useMemo(
    () => (patternMarkup ? makeSvgResponsive(recolorPatternSvg(patternMarkup, patternColor)) : null),
    [patternMarkup, patternColor]
  );


  // Only the fabric close-up is meant to fill its frame edge-to-edge
  // (object-cover) — it's meant to be a texture swatch, so cropping to fill
  // is normally fine. But some "Fabric Close-up" uploads are actually
  // full-body/product shots rather than a pure texture, so cropping them
  // chops off heads/feet. Hovering reveals the full, uncropped image
  // (letterboxed) so nothing important is ever permanently hidden — it
  // just goes back to the cropped fill once you move away.
  const isFilled = (label?: string) => label === "Fabric" && !hovering;
  // Thumbnails don't have their own hover-to-reveal (they're small anyway,
  // and jumping between cover/contain in a 64px square looks jittery), so
  // they use a plain, hover-independent check.
  const isThumbFilled = (label?: string) => label === "Fabric";

  // Touch devices have no hover, so "hovering" would otherwise never flip
  // true there and the fabric shot would stay permanently cropped. Press-
  // and-hold is the touch equivalent: finger down reveals the full image
  // (mirrors mouse-enter), lifting/cancelling the touch crops it back
  // (mirrors mouse-leave). A tap-and-release with no hold just flashes the
  // reveal briefly, which is fine — it still confirms nothing's hidden.
  const isTouchTarget = active?.label === "Fabric";
  const handleTouchStart = () => {
    if (isTouchTarget) setHovering(true);
  };
  const handleTouchEnd = () => {
    if (isTouchTarget) setHovering(false);
  };

  return (
    <div className="space-y-4">
      <div className="w-full max-w-[500px] mx-auto flex flex-col items-center px-4">
        <div
          className="relative rounded-xl shadow-lg overflow-hidden mb-4 w-full aspect-square bg-muted"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {isSvgSrc(displayed.src) ? (
            recoloredMarkup ? (
              // Inline markup (not an <img>) — required for the color
              // swatches below to actually retint this on selection.
              <div
                role="img"
                aria-label={displayed.label ? `${name} — ${displayed.label}` : name}
                className={cn(
                  "absolute inset-0 w-full h-full rounded-xl transition-opacity duration-150 bg-white flex items-center justify-center p-6",
                  isSwitching && "opacity-60"
                )}
                dangerouslySetInnerHTML={{ __html: recoloredMarkup }}
              />
            ) : (
              // Still fetching the raw SVG (or the fetch failed) — show the
              // plain image so the pattern is visible either way, just
              // without the recolor picker until/unless the fetch succeeds.
              <img
                src={displayed.src}
                alt={displayed.label ? `${name} — ${displayed.label}` : name}
                className={cn(
                  "absolute inset-0 w-full h-full rounded-xl transition-opacity duration-150 bg-white",
                  isFilled(displayed.label) ? "object-cover" : "object-contain",
                  isSwitching && "opacity-60"
                )}
              />
            )
          ) : (
            <Image
              src={displayed.src}
              alt={displayed.label ? `${name} — ${displayed.label}` : name}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 500px) 100vw, 500px"
              className={cn(
                "rounded-xl transition-opacity duration-150",
                isFilled(displayed.label) ? "object-cover" : "object-contain",
                isSwitching && "opacity-60"
              )}
            />
          )}
          {isSwitching && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading image" />
            </div>
          )}
          {displayed.label && (
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border border-border shadow-sm">
              {displayed.label}
            </Badge>
          )}
          {isTouchTarget && isFilled(displayed.label) && (
            <Badge
              variant="outline"
              className="absolute bottom-3 right-3 bg-background/90 text-foreground border-border shadow-sm sm:hidden"
            >
              Hold to view full image
            </Badge>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            {gallery.map((img, index) => (
              <button
                key={`${img.src}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Show ${img.label || "image"} ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  index === activeIndex
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {isSvgSrc(img.src) ? (
                  <img
                    src={img.src}
                    alt={img.label ? `${name} — ${img.label} thumbnail` : `${name} thumbnail`}
                    className={cn(
                      "absolute inset-0 w-full h-full bg-white",
                      isThumbFilled(img.label) ? "object-cover" : "object-contain"
                    )}
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt={img.label ? `${name} — ${img.label} thumbnail` : `${name} thumbnail`}
                    fill
                    sizes="64px"
                    className={isThumbFilled(img.label) ? "object-cover" : "object-contain"}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {recoloredMarkup && (
          <div className="w-full mt-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Palette className="h-3.5 w-3.5" />
              Pattern Color
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {PATTERN_COLORS.map(({ label, value }) => {
                const isSelected = patternColor === value;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPatternColor(value)}
                    aria-label={label}
                    aria-current={isSelected}
                    title={label}
                    className={cn(
                      "relative h-8 w-8 shrink-0 rounded-full border transition-transform hover:scale-110",
                      isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border"
                    )}
                    style={
                      value
                        ? { backgroundColor: value }
                        : {
                            background:
                              "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 10px 10px",
                          }
                    }
                  >
                    {isSelected && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-4 w-4",
                          value ? "text-white mix-blend-difference" : "text-foreground"
                        )}
                      />
                    )}
                  </button>
                );
              })}

              {/* Custom color — native picker, styled to match the preset swatches */}
              <label
                title="Custom color"
                className="relative h-8 w-8 shrink-0 rounded-full border border-border overflow-hidden cursor-pointer transition-transform hover:scale-110"
                style={{
                  background:
                    "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                }}
              >
                <input
                  type="color"
                  aria-label="Custom pattern color"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  value={patternColor || "#000000"}
                  onChange={(e) => setPatternColor(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

