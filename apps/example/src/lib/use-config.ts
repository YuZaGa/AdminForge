import { useEffect, useState } from "react";

let cachedConfig: Record<string, unknown> | null = null;
let cachedSession: { user?: { name?: string; email?: string }; role?: string } | null = null;
let fetchPromise: Promise<[Record<string, unknown>, { user?: { name?: string; email?: string }; role?: string }]> | null = null;

export function useConfig() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(cachedConfig);
  const [session, setSession] = useState(cachedSession);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig && cachedSession) return;
    if (!fetchPromise) {
      fetchPromise = Promise.all([
        fetch("/api/admin/_config").then((r) => r.json()),
        fetch("/api/auth/session").then((r) => r.json()),
      ]);
    }
    fetchPromise
      .then(([cfg, sess]) => {
        cachedConfig = cfg;
        cachedSession = sess;
        setConfig(cfg);
        setSession(sess);
      })
      .finally(() => setLoading(false));
  }, []);

  return { config, session, loading };
}
