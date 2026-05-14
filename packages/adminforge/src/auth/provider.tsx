"use client";

import { createContext, useContext } from "react";

interface AdminSession {
  user: { id: string; email: string; role?: string } | null;
  role?: string;
}

const AdminSessionContext = createContext<AdminSession>({ user: null });

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  return (
    <AdminSessionContext.Provider value={session}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSession {
  return useContext(AdminSessionContext);
}
