"use client";

import { CollectionFormPage } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { use } from "react";
import { useConfig } from "../../../../lib/use-config";

export default function NewRecord({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionName } = use(params);
  const { config, loading } = useConfig();

  if (loading) return <div className="adminforge-loading">Loading...</div>;

  const cfg = config as unknown as AdminForgeConfig;
  const collection = cfg.collections.find((c) => c.name === collectionName);
  if (!collection) return <div>Collection not found</div>;

  return <CollectionFormPage config={cfg} collection={collection} record={null} isNew={true} />;
}
