"use client";

import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { openPinDialog } from "@/lib/pinterest";
import { cn } from "@/lib/utils";

interface Props {
  /** Page the pin links back to (product page). */
  url: string;
  /** Image to pin. Must not be an SVG; use pinnableImage(). */
  media: string;
  description: string;
  /** "overlay": red pill shown on top of an image. "inline": text button next to Share. "icon": small round button. */
  variant?: "overlay" | "inline" | "icon";
  className?: string;
}

/** Pinterest "Save" button. Opens Pinterest's own save dialog, so no Pinterest script has to load. */
export default function PinSaveButton({ url, media, description, variant = "overlay", className }: Props) {
  if (!media) return null;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openPinDialog({ url, media, description });
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-[#E60023] hover:bg-muted transition-colors",
          className
        )}
      >
        <PinterestIcon className="h-4 w-4 text-[#E60023]" />
        Save to Pinterest
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Save to Pinterest"
        title="Save to Pinterest"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E60023] text-white shadow-sm hover:bg-[#ad081b] transition-colors",
          className
        )}
      >
        <PinterestIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Save to Pinterest"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#E60023] px-3 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-[#ad081b] transition-colors",
        className
      )}
    >
      <PinterestIcon className="h-4 w-4" />
      Save
    </button>
  );
}
