import { ASSET_TYPES } from "@/lib/assetTypes";
import { cn } from "@/lib/utils";
import Link from "next/link";

/** "All / Garments / Fabrics / …" tabs above the shop grid. */
export default function AssetTypeTabs({ active }: { active?: string }) {
  const tabs = [{ type: "", label: "All files" }, ...ASSET_TYPES.map((t) => ({ type: t.type, label: t.label }))];
  return (
    <nav aria-label="File type" className="mx-auto mb-8 max-w-7xl">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {tabs.map((t) => {
          const on = (active || "") === t.type;
          return (
            <Link
              key={t.type || "all"}
              href={t.type ? `/shop?type=${t.type}` : "/shop"}
              aria-current={on ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
