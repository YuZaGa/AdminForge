"use client";

import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import { TableEngine } from "../table-engine/TableEngine.js";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CollectionListPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  data: unknown[];
}

export function CollectionListPage({ config, collection, data }: CollectionListPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/admin/${collection.name}?${params.toString()}`);
  }, [search, collection.name, router]);

  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2>{collection.label}</h2>
          <Link
            href={`/admin/${collection.name}/new`}
            className="adminforge-btn adminforge-btn-primary"
          >
            Create New
          </Link>
        </div>
        <form onSubmit={handleSearch} className="adminforge-search">
          <input
            type="text"
            className="adminforge-search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <TableEngine
          collection={collection}
          data={data}
          basePath={`/admin/${collection.name}`}
        />
      </div>
    </AdminLayout>
  );
}
