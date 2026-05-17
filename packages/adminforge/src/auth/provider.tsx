"use client";

import { createContext, useContext } from "react";

interface AdminSession {
  user: { id: string; email: string; role?: string } | null;
  role?: string;
}

const AdminSessionContext = createContext<AdminSession | null>(null);

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession | null;
}) {
  return (
    <AdminSessionContext.Provider value={session}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSession | null {
  return useContext(AdminSessionContext);
}
