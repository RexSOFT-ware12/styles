"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export interface ProductMeta {
  categories: string[];
  styles: string[];
  fabrics: string[];
  brands: string[];
}

const ALL = "__all__";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

/**
 * Filter/sort bar for the product grid. Every change is written straight to
 * the URL (?category=&style=&fabric=&brand=&minPrice=&maxPrice=&sort=) so
 * results stay shareable/bookmarkable and the back button works — this
 * component holds no filter state of its own besides the price inputs
 * (which need to be editable before committing to the URL on blur/enter).
 */
export default function ProductFilterBar({ meta }: { meta: ProductMeta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const category = searchParams.get("category") ?? ALL;
  const style = searchParams.get("style") ?? ALL;
  const fabric = searchParams.get("fabric") ?? ALL;
  const brand = searchParams.get("brand") ?? ALL;
  const sort = searchParams.get("sort") ?? "newest";

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
    });
    // Any filter change invalidates the current page of results.
    params.delete("page");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const commitPriceRange = () => {
    updateParams({
      minPrice: minPrice.trim() || null,
      maxPrice: maxPrice.trim() || null,
    });
  };

  const hasActiveFilters =
    category !== ALL ||
    style !== ALL ||
    fabric !== ALL ||
    brand !== ALL ||
    Boolean(searchParams.get("minPrice")) ||
    Boolean(searchParams.get("maxPrice")) ||
    Boolean(searchParams.get("search"));

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  return (
    <div className="max-w-7xl mx-auto mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {meta.categories.length > 0 && (
          <Select
            value={category}
            onValueChange={(v) => updateParams({ category: v })}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Categories</SelectItem>
              {meta.categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {meta.styles.length > 0 && (
          <Select value={style} onValueChange={(v) => updateParams({ style: v })}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by style">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Styles</SelectItem>
              {meta.styles.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {meta.fabrics.length > 0 && (
          <Select value={fabric} onValueChange={(v) => updateParams({ fabric: v })}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by fabric">
              <SelectValue placeholder="Fabric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Fabrics</SelectItem>
              {meta.fabrics.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {meta.brands.length > 0 && (
          <Select value={brand} onValueChange={(v) => updateParams({ brand: v })}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by brand">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Brands</SelectItem>
              {meta.brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={commitPriceRange}
            onKeyDown={(e) => e.key === "Enter" && commitPriceRange()}
            className="w-24"
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={commitPriceRange}
            onKeyDown={(e) => e.key === "Enter" && commitPriceRange()}
            className="w-24"
            aria-label="Maximum price"
          />
        </div>

        <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="w-[170px] ml-auto" aria-label="Sort products">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
