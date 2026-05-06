"use client";

import { CollectionFormPage } from "@adminforge/admin-ui";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function NewRecord() {
  const params = useParams<{ collection: string }>();
  const [config, setConfig] = useState<React.ComponentProps<typeof CollectionFormPage>["config"] | null>(null);
  const [collection, setLocalCollection] = useState<React.ComponentProps<typeof CollectionFormPage>["collection"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.collection) return;
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        setConfig(cfg);
        const col = cfg.collections.find(
          (c: { name: string }) => c.name === params.collection
        );
        setLocalCollection(col ?? null);
      })
      .finally(() => setLoading(false));
  }, [params?.collection]);

  if (loading) return <div className="adminforge-loading">Loading...</div>;
  if (!config || !collection) return <div>Collection not found</div>;

  return (
    <CollectionFormPage config={config} collection={collection} record={null} isNew={true} />
  );
}
