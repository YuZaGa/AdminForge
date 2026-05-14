"use client";

import React, { createContext, useContext } from "react";
import type { AdminForgeConfig } from "../core/index.js";

interface AdminForgeContextType {
  config: AdminForgeConfig | undefined;
  apiBase: string;
}

const AdminForgeContext = createContext<AdminForgeContextType>({ config: undefined, apiBase: "/api" });

export function AdminForgeProvider({ 
  children, 
  config: initialConfig, 
  apiBase = "/api" 
}: { 
  children: React.ReactNode; 
  config?: AdminForgeConfig;
  apiBase?: string;
}) {
  const [config, setConfig] = React.useState<AdminForgeConfig | undefined>(initialConfig);

  React.useEffect(() => {
    if (!config) {
      fetch(`${apiBase}/_config`)
        .then(res => res.ok ? res.json() : null)
        .then(cfg => cfg?.collections ? setConfig(cfg) : null);
    }
  }, [config, apiBase]);

  return (
    <AdminForgeContext.Provider value={{ config, apiBase }}>
      {children}
    </AdminForgeContext.Provider>
  );
}

export function useAdminForge() {
  return useContext(AdminForgeContext);
}
