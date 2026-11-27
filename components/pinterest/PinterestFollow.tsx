"use client";

import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { loadPinterestSettings } from "@/lib/pinterest";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/** "Follow us on Pinterest" link. Hidden until a profile link is set in Admin → Pinterest. */
export default function PinterestFollow({ profileUrl: given, className }: { profileUrl?: string; className?: string }) {
  const [url, setUrl] = useState(given || "");

  useEffect(() => {
    if (given) return;
    let live = true;
    loadPinterestSettings().then((s) => live && setUrl(s.profileUrl));
    return () => {
      live = false;
    };
  }, [given]);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-[#E60023] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ad081b] transition-colors",
        className
      )}
    >
      <PinterestIcon className="h-4 w-4" />
      Follow us on Pinterest
    </a>
  );
}
