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
import { AdminForgeProvider } from "./AdminForgeContext.js";

interface AdminDashboardProps {
  config: AdminForgeConfig;
  params: { admin?: string[] };
  apiBase?: string;
}

export function AdminDashboard({ config, params, apiBase = "/api/admin" }: AdminDashboardProps) {
  const adminParams = params.admin || [];
  const [segment, subSegment, id] = adminParams;
  const [data, setData] = React.useState<any>(null);
  const [record, setRecord] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  // Data fetcher for the dashboard
  React.useEffect(() => {
    // List fetch
    if (segment === "collections" && subSegment && !id) {
      setLoading(true);
      fetch(`${apiBase}/${subSegment}`)
        .then(res => res.json())
        .then(res => {
          setData(res);
          setLoading(false);
        });
    }
    // Single record fetch for Edit
    if (segment === "collections" && subSegment && id && id !== "new" && id !== "schema") {
      setLoading(true);
      fetch(`${apiBase}/${subSegment}/${id}`)
        .then(res => res.json())
        .then(res => {
          setRecord(res);
          setLoading(false);
        });
    }
  }, [segment, subSegment, id, apiBase]);

  const content = () => {
    if (loading) return <AdminLayout config={config}><div style={{ padding: '40px' }}>Loading...</div></AdminLayout>;

    // Root /admin
    if (adminParams.length === 0) {
      return <AdminPage config={config} />;
    }

    // /admin/roles
    if (segment === "roles") {
      if (subSegment) return <RoleDetailPage config={config} roleId={subSegment} />;
      return <RolesListPage config={config} />;
    }

    // /admin/collections/[name]
    if (segment === "collections" && subSegment) {
      const collection = config.collections.find(c => c.name === subSegment);
      if (!collection) return <AdminLayout config={config}><div>Collection {subSegment} not found</div></AdminLayout>;

      if (id === "new") return <CollectionFormPage config={config} collection={collection} isNew />;
      if (id === "schema") return <CollectionSchemaPage config={config} collection={collection} />;
      if (id) return <CollectionFormPage config={config} collection={collection} isNew={false} record={record} />;
      
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
      {content()}
    </AdminForgeProvider>
  );
}
