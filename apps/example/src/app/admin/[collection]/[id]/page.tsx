"use client";

import { CollectionFormPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useEffect, useState, use } from "react";
import { useConfig } from "../../../../lib/use-config";

export default function EditRecord({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection: collectionName, id } = use(params);
  const { config, loading: configLoading } = useConfig();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/${collectionName}/${id}`)
      .then((r) => r.json())
      .then(setRecord)
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [collectionName, id]);

  if (configLoading || loading) return <div className="adminforge-loading">Loading...</div>;

  const cfg = config as unknown as AdminForgeConfig;
  const collection = cfg.collections.find((c) => c.name === collectionName);
  if (!collection) return <div>Collection not found</div>;

  return <CollectionFormPage config={cfg} collection={collection} record={record} isNew={false} />;
}
