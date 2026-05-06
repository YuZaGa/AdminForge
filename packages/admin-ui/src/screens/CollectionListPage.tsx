"use client";

import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import { TableEngine } from "../table-engine/TableEngine.js";

interface CollectionListPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  data: unknown[];
}

export function CollectionListPage({ config, collection, data }: CollectionListPageProps) {
  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2>{collection.label}</h2>
          <a
            href={`/admin/${collection.name}/new`}
            className="adminforge-btn adminforge-btn-primary"
          >
            Create New
          </a>
        </div>
        <TableEngine
          collection={collection}
          data={data}
          basePath={`/admin/${collection.name}`}
        />
      </div>
    </AdminLayout>
  );
}
