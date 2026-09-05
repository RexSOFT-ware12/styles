"use client";

import { Badge } from "@/components/ui/badge";
import { cn, isSvgSrc } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface GalleryImage {
  src: string;
  label?: string;
}

const AUTOPLAY_INTERVAL_MS = 3500;

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
            <img
              src={displayed.src}
              alt={displayed.label ? `${name} — ${displayed.label}` : name}
              className={cn(
                "absolute inset-0 w-full h-full rounded-xl transition-opacity duration-150 bg-white",
                isFilled(displayed.label) ? "object-cover" : "object-contain",
                isSwitching && "opacity-60"
              )}
            />
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
      </div>
    </div>
  );
}

