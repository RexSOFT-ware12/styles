"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiStatus, fetchApiStatus } from "@/lib/apiBilling";

/**
 * Loads the signed-in user's API-tier subscription + key list. Used by
 * /account/api (key management) and /developers (to show "Manage" instead
 * of "Subscribe" for someone who already has an API plan).
 */
export function useApiEntitlement(token: string | null) {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setStatus(await fetchApiStatus(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your API access status");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { status, loading, error, reload };
}
