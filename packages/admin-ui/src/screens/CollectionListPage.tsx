"use client";

import type { AdminForgeConfig, CollectionDefinition, AccessConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import { TableEngine } from "../table-engine/TableEngine.js";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CollectionListPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  data: unknown[];
  role?: string;
}

function hasAccess(access: AccessConfig | undefined, operation: string, role?: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  if (!role) return false;
  return allowed.includes(role);
}

export function CollectionListPage({ config, collection, data, role }: CollectionListPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const canCreate = hasAccess(collection.access, "create", role);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("search", search);
    else params.delete("search");
    router.push(`/admin/${collection.name}?${params.toString()}`);
  }, [search, collection.name, router]);

  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`} role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2>{collection.label}</h2>
          {canCreate && (
            <Link href={`/admin/${collection.name}/new`} className="adminforge-btn adminforge-btn-primary">
              Create New
            </Link>
          )}
        </div>
        <form onSubmit={handleSearch} className="adminforge-search">
          <input type="text" className="adminforge-search-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <TableEngine collection={collection} data={data} basePath={`/admin/${collection.name}`} role={role} />
      </div>
    </AdminLayout>
  );
}
