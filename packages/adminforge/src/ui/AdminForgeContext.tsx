"use client";

import React, { createContext, useContext } from "react";
import type { AdminForgeConfig } from "../core/index.js";

interface AdminForgeContextType {
  config: AdminForgeConfig | undefined;
  apiBase: string;
  unauthorized: boolean;
}

const AdminForgeContext = createContext<AdminForgeContextType>({ 
  config: undefined, 
  apiBase: "/api/adminforge",
  unauthorized: false 
});

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
  const [unauthorized, setUnauthorized] = React.useState(false);

  React.useEffect(() => {
    // 1. Inject Material Symbols if missing
    if (typeof document !== "undefined" && !document.getElementById("adminforge-fonts")) {
      const link = document.createElement("link");
      link.id = "adminforge-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
      document.head.appendChild(link);
    }

    // 2. Auto-fetch config if not provided
    if (!config) {
      fetch(`${apiBase}/_config`)
        .then(res => {
          if (res.status === 401) {
            setUnauthorized(true);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then(cfg => cfg?.collections ? setConfig(cfg) : null)
        .catch(e => console.error("[AdminForge] Failed to fetch config:", e));
    }
  }, [config, apiBase]);

  return (
    <AdminForgeContext.Provider value={{ config, apiBase, unauthorized }}>
      {children}
    </AdminForgeContext.Provider>
  );
}

export function useAdminForge() {
  return useContext(AdminForgeContext);
}
