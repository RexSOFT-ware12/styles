"use client";

import { Button } from "@/components/ui/button";
import { useCompare, MAX_COMPARE } from "@/context/CompareContext";
import { Scale, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CompareBar() {
  const { ids, clear } = useCompare();
  const pathname = usePathname();
  if (ids.length === 0 || pathname === "/compare") return null;
  const ready = ids.length >= 2;
  return (
    <div className="fixed bottom-4 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg">
      <Scale className="h-4 w-4 text-primary" aria-hidden />
      <span className="text-sm font-medium">
        {ids.length} of {MAX_COMPARE} selected{!ready && " — pick one more"}
      </span>
      {ready && (
        <Button size="sm" asChild>
          <Link href="/compare">Compare</Link>
        </Button>
      )}
      <button type="button" onClick={clear} className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Clear comparison">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
