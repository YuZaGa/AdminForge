"use client";

import { RolesListPage } from "adminforge/ui";
import type { AdminForgeConfig } from "adminforge";
import { useConfig } from "../../../lib/use-config";

export default function RolesList() {
  const { config, session, loading } = useConfig();

  if (loading || !config) return <div className="adminforge-loading">Loading...</div>;

  return (
    <RolesListPage 
      config={config as unknown as AdminForgeConfig} 
      role={(session as { role?: string })?.role} 
    />
  );
}
