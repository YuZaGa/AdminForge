"use client";

import { RoleDetailPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useConfig } from "../../../../lib/use-config";
import { use } from "react";

export default function RoleDetail({ params }: { params: Promise<{ role: string }> }) {
  const { role: roleId } = use(params);
  const { config, session, loading } = useConfig();

  if (loading || !config) return <div className="adminforge-loading">Loading...</div>;

  return (
    <RoleDetailPage 
      config={config as unknown as AdminForgeConfig} 
      roleId={roleId}
      role={(session as { role?: string })?.role} 
    />
  );
}
