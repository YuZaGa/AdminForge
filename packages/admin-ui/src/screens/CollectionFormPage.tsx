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
}

export function CollectionFormPage({ config, collection, record, isNew }: CollectionFormPageProps) {
  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2>{isNew ? `Create ${collection.label}` : `Edit ${collection.label}`}</h2>
          <Link
            href={`/admin/${collection.name}`}
            className="adminforge-btn adminforge-btn-secondary"
          >
            Back
          </Link>
        </div>
        <FormEngine
          collection={collection}
          record={record}
          isNew={isNew}
        />
      </div>
    </AdminLayout>
  );
}
