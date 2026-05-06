"use client";

import { CollectionListPage } from "@adminforge/admin-ui";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CollectionPageData {
  config: React.ComponentProps<typeof CollectionListPage>["config"];
  collection: React.ComponentProps<typeof CollectionListPage>["collection"];
  data: unknown[];
}

export default function CollectionList() {
  const params = useParams<{ collection: string }>();
  const [pageData, setPageData] = useState<CollectionPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.collection) return;
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch(`/api/${params.collection}`).then((r) => r.json()),
    ])
      .then(([config, result]) => {
        const collection = config.collections.find(
          (c: { name: string }) => c.name === params.collection
        );
        if (collection) {
          setPageData({ config, collection, data: result.data ?? [] });
        }
      })
      .finally(() => setLoading(false));
  }, [params?.collection]);

  if (loading) return <div className="adminforge-loading">Loading...</div>;
  if (!pageData) return <div>Collection not found</div>;

  return (
    <CollectionListPage
      config={pageData.config}
      collection={pageData.collection}
      data={pageData.data}
    />
  );
}
