"use client";

import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import { FormEngine } from "../form-engine/FormEngine.js";
import Link from "next/link";

interface CollectionFormPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  record?: Record<string, unknown> | null;
  isNew: boolean;
  role?: string;
}

export function CollectionFormPage({ config, collection, record, isNew, role }: CollectionFormPageProps) {
  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`} role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2>{isNew ? `Create ${collection.label}` : `Edit ${collection.label}`}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isNew && (
              <button
                className="adminforge-btn adminforge-btn-danger"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this item?")) {
                    const res = await fetch(`/api/${collection.name}/${record?.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      window.location.href = `/admin/${collection.name}`;
                    } else {
                      const err = await res.json();
                      alert(err.error || "Failed to delete item");
                    }
                  }
                }}
              >
                Delete
              </button>
            )}
            <Link href={`/admin/${collection.name}`} className="adminforge-btn adminforge-btn-secondary">Back</Link>
          </div>
        </div>
        <FormEngine collection={collection} record={record} isNew={isNew} role={role} />
      </div>
    </AdminLayout>
  );
}
