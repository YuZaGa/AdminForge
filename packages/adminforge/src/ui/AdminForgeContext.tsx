"use client";

import React, { createContext, useContext } from "react";
import type { AdminForgeConfig } from "../core/index.js";

interface AdminForgeContextType {
  config: AdminForgeConfig;
  apiBase: string;
}

const AdminForgeContext = createContext<AdminForgeContextType | undefined>(undefined);

export function AdminForgeProvider({ 
  children, 
  config, 
  apiBase 
}: { 
  children: React.ReactNode; 
  config: AdminForgeConfig;
  apiBase: string;
}) {
  return (
    <AdminForgeContext.Provider value={{ config, apiBase }}>
      {children}
    </AdminForgeContext.Provider>
  );
}

export function useAdminForge() {
  const context = useContext(AdminForgeContext);
  if (!context) {
    throw new Error("useAdminForge must be used within an AdminForgeProvider");
  }
  return context;
}
