"use client";

import { CollectionListPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useEffect, useState, use } from "react";
import { useConfig } from "../../../lib/use-config";

export default function CollectionList({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionName } = use(params);
  const { config, loading: configLoading } = useConfig();
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/${collectionName}`)
      .then((r) => r.json())
      .then((result) => setData(result.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionName]);

  if (configLoading || loading) {
    return <div className="adminforge-loading">Loading...</div>;
  }

  const cfg = config as unknown as AdminForgeConfig;
  const collection = cfg.collections.find((c) => c.name === collectionName);
  if (!collection) return <div>Collection not found</div>;

  return <CollectionListPage config={cfg} collection={collection} data={data} />;
}
