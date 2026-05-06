"use client";

import { AdminPage } from "@adminforge/admin-ui";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [config, setConfig] = useState<React.ComponentProps<typeof AdminPage>["config"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adminforge-loading">Loading...</div>;
  if (!config) return <div className="adminforge-loading">Failed to load config</div>;

  return <AdminPage config={config} />;
}
