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

