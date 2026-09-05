import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** True when a product image URL is an SVG (e.g. a traced Design Pattern).
 *  Used to render those via a plain <img> instead of next/image — SVGs are
 *  already tiny vector files with nothing to optimize, and routing them
 *  through the image optimizer adds failure points (remote-pattern host/port
 *  matching, the dangerouslyAllowSVG opt-in, its sandboxed CSP) for zero
 *  benefit. A plain <img> just renders whatever the backend serves. */
export function isSvgSrc(src: string): boolean {
  if (!src) return false;
  try {
    const path = src.split("?")[0].split("#")[0];
    return path.toLowerCase().endsWith(".svg");
  } catch {
    return false;
  }
}

/** Matches the single flat fill color every traced Design Pattern shape
 *  uses (see style-backend/src/lib/svgConvert.js) — "#000000" going
 *  forward, or the literal word "black" for patterns traced before that
 *  file switched from potrace's "auto" color mode to an explicit hex. Every
 *  shape shares exactly this one fill value; only fill-opacity differs
 *  between shapes to create tone/shading. That's what makes a single
 *  find-and-replace enough to retint the whole pattern correctly. */
const PATTERN_BASE_FILL = /fill="(#000000|#000|black)"/gi;

/** Returns a recolored copy of a traced Design Pattern SVG's markup, or the
 *  markup unchanged if `color` is null (meaning "show the original color").
 *  Safe to call on non-pattern SVG markup too — it's a no-op if none of the
 *  expected base-fill values are present. */
export function recolorPatternSvg(svgMarkup: string, color: string | null): string {
  if (!color) return svgMarkup;
  return svgMarkup.replace(PATTERN_BASE_FILL, `fill="${color}"`);
}

/** Strips the hardcoded width/height off a fetched SVG's root <svg> tag and
 *  replaces them with 100%/100%, so it scales responsively to fill whatever
 *  container it's placed in (its viewBox is untouched, so aspect ratio and
 *  all path coordinates stay correct). Only touches the first opening tag —
 *  never anything inside the document. */
export function makeSvgResponsive(svgMarkup: string): string {
  return svgMarkup.replace(
    /^(\s*<svg\b[^>]*?)\swidth="[^"]*"([^>]*?)\sheight="[^"]*"/i,
    '$1 width="100%"$2 height="100%"'
  );
}

