import { useEffect, useState } from "react";

let cachedConfig: Record<string, unknown> | null = null;
let fetchPromise: Promise<Record<string, unknown>> | null = null;

export function useConfig() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) return;
    if (!fetchPromise) {
      fetchPromise = fetch("/api/config").then((r) => r.json());
    }
    fetchPromise
      .then((data) => {
        cachedConfig = data;
        setConfig(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
