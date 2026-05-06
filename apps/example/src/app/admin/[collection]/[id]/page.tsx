"use client";

import { CollectionFormPage } from "@adminforge/admin-ui";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditRecord() {
  const params = useParams<{ collection: string; id: string }>();
  const [config, setConfig] = useState<React.ComponentProps<typeof CollectionFormPage>["config"] | null>(null);
  const [collection, setLocalCollection] = useState<React.ComponentProps<typeof CollectionFormPage>["collection"] | null>(null);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.collection || !params?.id) return;
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch(`/api/${params.collection}/${params.id}`).then((r) => r.json()),
    ])
      .then(([cfg, rec]) => {
        setConfig(cfg);
        const col = cfg.collections.find(
          (c: { name: string }) => c.name === params.collection
        );
        setLocalCollection(col ?? null);
        setRecord(rec);
      })
      .finally(() => setLoading(false));
  }, [params?.collection, params?.id]);

  if (loading) return <div className="adminforge-loading">Loading...</div>;
  if (!config || !collection) return <div>Collection not found</div>;

  return (
    <CollectionFormPage config={config} collection={collection} record={record} isNew={false} />
  );
}
