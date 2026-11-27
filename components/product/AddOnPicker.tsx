"use client";

import { ADDON_LABEL } from "@/lib/assetTypes";
import { cn } from "@/lib/utils";
import type { ProductAddOn } from "@/types/product";
import { Check, FileSpreadsheet, Scissors } from "lucide-react";

/**
 * "Make it sewable": tick a tech pack and/or DXF pattern to add them to the
 * cart with the garment. They're ordinary products, so checkout and
 * downloads work exactly like any other file.
 */
export default function AddOnPicker({
  addOns,
  selected,
  inCart,
  onToggle,
}: {
  addOns: ProductAddOn[];
  selected: string[];
  inCart: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  const available = addOns.filter((a) => a.hasDigitalFile);
  if (!available.length) return null;

  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">Make it sewable</legend>
      <p className="mb-3 text-xs text-muted-foreground">Add production files for a factory, tailor or plotter.</p>
      <div className="space-y-2">
        {available.map((a) => {
          const already = inCart(a.id);
          const on = already || selected.includes(a.id);
          const label = ADDON_LABEL[a.addOnKind] || { title: a.name, text: a.description || "" };
          const Icon = a.addOnKind === "dxf" ? Scissors : FileSpreadsheet;
          return (
            <label
              key={a.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                already && "cursor-default"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                disabled={already}
                onChange={() => onToggle(a.id)}
              />
              <span
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                )}
                aria-hidden
              >
                {on && <Check className="h-3.5 w-3.5" />}
              </span>
              <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{label.title}</span>
                <span className="block text-xs text-muted-foreground">{already ? "Already in your cart" : label.text}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-foreground">+${a.price.toFixed(2)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
