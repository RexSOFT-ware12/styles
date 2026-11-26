"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export const MAX_COMPARE = 3;
const KEY = "fabricnow_compare_v1";

interface CompareContextProps {
  ids: (string | number)[];
  isComparing: (id: string | number) => boolean;
  /** Returns false when the list is full and the item wasn't added. */
  toggle: (id: string | number) => boolean;
  remove: (id: string | number) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) setIds(raw.slice(0, MAX_COMPARE));
    } catch {}
  }, []);

  const save = (next: (string | number)[]) => {
    setIds(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const isComparing = useCallback((id: string | number) => ids.some((x) => String(x) === String(id)), [ids]);

  const toggle = (id: string | number) => {
    if (isComparing(id)) {
      save(ids.filter((x) => String(x) !== String(id)));
      return true;
    }
    if (ids.length >= MAX_COMPARE) return false;
    save([...ids, id]);
    return true;
  };

  return (
    <CompareContext.Provider
      value={{ ids, isComparing, toggle, remove: (id) => save(ids.filter((x) => String(x) !== String(id))), clear: () => save([]) }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
