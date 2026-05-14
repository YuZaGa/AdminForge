"use client";
import React from "react";
import { AdminLayout } from "./components/AdminLayout.js";
import { AdminPage } from "./screens/AdminPage.js";
import { CollectionListPage } from "./screens/CollectionListPage.js";
import { CollectionFormPage } from "./screens/CollectionFormPage.js";
import { CollectionSchemaPage } from "./screens/CollectionSchemaPage.js";
import { RolesListPage } from "./screens/RolesListPage.js";
import { RoleDetailPage } from "./screens/RoleDetailPage.js";
import type { AdminForgeConfig } from "../core/index.js";
import { useAdminForge, AdminForgeProvider } from "./AdminForgeContext.js";

interface AdminDashboardProps {
  config?: AdminForgeConfig;
  params?: { admin?: string[] };
  apiBase?: string;
}

export function AdminDashboard({ config: initialConfig, params: initialParams, apiBase: initialApiBase }: AdminDashboardProps) {
  const ctx = useAdminForge();
  const config = initialConfig ?? ctx.config;
  const apiBase = initialApiBase ?? ctx.apiBase;

  const [adminParams, setAdminParams] = React.useState<string[]>(initialParams?.admin || []);
  const [data, setData] = React.useState<any>(null);
  const [record, setRecord] = React.useState<any>(null);

  React.useEffect(() => {
    if (!initialParams && typeof window !== "undefined") {
      const path = window.location.pathname;
      const segments = path.split("/admin/").pop()?.split("/") || [];
      setAdminParams(segments.filter(Boolean));
    }
  }, [initialParams]);

  const [segment, actionOrId] = adminParams;

  React.useEffect(() => {
    if (!config) return;
    const isCollection = config.collections.some((c: any) => c.name === segment);
    if (!isCollection) return;

    if (!actionOrId) {
      fetch(`${apiBase}/${segment}`)
        .then(res => res.ok ? res.json() : Promise.reject(`${res.status} ${res.statusText}`))
        .then(res => setData(res))
        .catch(e => console.error(`[AdminForge] Failed to fetch ${apiBase}/${segment}:`, e));
    } else if (actionOrId !== "new" && actionOrId !== "schema") {
      fetch(`${apiBase}/${segment}/${actionOrId}`)
        .then(res => res.ok ? res.json() : Promise.reject(`${res.status} ${res.statusText}`))
        .then(res => setRecord(res))
        .catch(e => console.error(`[AdminForge] Failed to fetch ${apiBase}/${segment}/${actionOrId}:`, e));
    }
  }, [segment, actionOrId, apiBase, config]);

  if (!config) return null;

  const renderContent = () => {
    if (adminParams.length === 0) return <AdminPage config={config} />;

    if (segment === "roles") {
      if (actionOrId) return <RoleDetailPage config={config} roleId={actionOrId} />;
      return <RolesListPage config={config} />;
    }

    const collection = config.collections.find((c: any) => c.name === segment);
    if (collection) {
      if (actionOrId === "new") return <CollectionFormPage config={config} collection={collection} isNew />;
      if (actionOrId === "schema") return <CollectionSchemaPage config={config} collection={collection} />;
      if (actionOrId) return <CollectionFormPage config={config} collection={collection} isNew={false} record={record} />;

      return (
        <CollectionListPage
          config={config}
          collection={collection}
          data={data?.data || []}
          total={data?.total || 0}
          page={data?.page || 1}
          pageSize={data?.pageSize || 10}
        />
      );
    }

    return <AdminPage config={config} />;
  };

  return (
    <AdminForgeProvider config={config} apiBase={apiBase}>
      {renderContent()}
    </AdminForgeProvider>
  );
}
