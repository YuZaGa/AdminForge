"use client";

import { AdminPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useConfig } from "../../lib/use-config";

export default function AdminDashboard() {
  const { config, session, loading } = useConfig();
  if (loading) return <div className="adminforge-loading">Loading...</div>;
  if (!config) return <div className="adminforge-loading">Failed to load config</div>;
  return <AdminPage config={config as unknown as AdminForgeConfig} role={(session as { role?: string })?.role} />;
}
