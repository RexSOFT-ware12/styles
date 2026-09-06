"use client";

import { useCallback, useEffect, useState } from "react";
import { EntitlementStatus, fetchEntitlement } from "@/lib/billing";

/**
 * Loads trial/subscription status for the signed-in user. Used by the
 * Garment Tool, Pose Tool, and SVG customization pages to decide whether to
 * show the tool or the upgrade paywall.
 */
export function useEntitlement(token: string | null) {
  const [entitlement, setEntitlement] = useState<EntitlementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setEntitlement(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEntitlement(await fetchEntitlement(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your account status");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entitlement, loading, error, reload };
}
