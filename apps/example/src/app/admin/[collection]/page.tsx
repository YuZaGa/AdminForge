"use client";

import { CollectionListPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useConfig } from "../../../lib/use-config";

export default function CollectionList({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionName } = use(params);
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") ?? "";
  const page = parseInt(searchParams?.get("page") ?? "1");
  const pageSize = parseInt(searchParams?.get("pageSize") ?? "10");
  
  const { config, session, loading: configLoading } = useConfig();
  const [result, setResult] = useState<{ data: unknown[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL(`${window.location.origin}/api/${collectionName}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    if (search) url.searchParams.set("search", search);
    
    fetch(url.toString())
      .then((r) => r.json())
      .then((res) => setResult(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionName, search, page, pageSize]);

  if (configLoading || loading || !result) return <div className="adminforge-loading">Loading...</div>;

  const cfg = config as unknown as AdminForgeConfig;
  const collection = cfg.collections.find((c) => c.name === collectionName);
  if (!collection) return <div>Collection not found</div>;

  return (
    <CollectionListPage 
      config={cfg} 
      collection={collection} 
      data={result.data} 
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      role={(session as { role?: string })?.role} 
    />
  );
}
