import type { AdminForgeConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";

interface AdminPageProps {
  config: AdminForgeConfig;
}

export function AdminPage({ config }: AdminPageProps) {
  return (
    <AdminLayout config={config} currentPath="/admin">
      <div className="adminforge-dashboard">
        <h2>Dashboard</h2>
        <div className="adminforge-collection-grid">
          {config.collections.map((collection) => (
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
