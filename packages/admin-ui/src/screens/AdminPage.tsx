"use client";

import type { AdminForgeConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";

interface AdminPageProps {
  config: AdminForgeConfig;
  role?: string;
}

export function AdminPage({ config, role }: AdminPageProps) {
  return (
    <AdminLayout config={config} currentPath="/admin" role={role}>
      <div className="adminforge-dashboard">
        <h2>Dashboard</h2>
        <div className="adminforge-collection-grid">
          {config.collections
            .filter((c) => {
              const a = c.access;
              return !a?.read || !role || a.read.includes(role);
            })
            .map((collection) => (
              <a
                key={collection.name}
                href={`/admin/${collection.name}`}
                className="adminforge-collection-card"
              >
                <h3>{collection.label}</h3>
                <p>{Object.keys(collection.fields).length} fields</p>
              </a>
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}
