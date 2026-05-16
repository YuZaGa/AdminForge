"use client";
import React from "react";
import { AdminLayout } from "./components/AdminLayout.js";
import { AdminPage } from "./screens/AdminPage.js";
import { CollectionListPage } from "./screens/CollectionListPage.js";
import { CollectionFormPage } from "./screens/CollectionFormPage.js";
import { CollectionSchemaPage } from "./screens/CollectionSchemaPage.js";
import { RolesListPage } from "./screens/RolesListPage.js";
import { RoleDetailPage } from "./screens/RoleDetailPage.js";
import { AgentTokenPage } from "./screens/AgentTokenPage.js";
import type { AdminForgeConfig } from "../core/index.js";
import { useAdminForge, AdminForgeProvider } from "./AdminForgeContext.js";
import { useAdminSession } from "../auth/provider.js";
import { useSearchParams } from "next/navigation.js";

interface AdminDashboardProps {
  config?: AdminForgeConfig;
  params?: { admin?: string[] } | Promise<{ admin?: string[] }>;
  apiBase?: string;
}

export function AdminDashboard({ config: initialConfig, params: initialParams, apiBase: initialApiBase }: AdminDashboardProps) {
  const ctx = useAdminForge();
  const config = initialConfig ?? ctx.config;
  const apiBase = initialApiBase ?? ctx.apiBase;
  const searchParams = useSearchParams();
  const queryStr = searchParams.toString();

  const [adminParams, setAdminParams] = React.useState<string[]>([]);
  const [data, setData] = React.useState<any>(null);
  const [record, setRecord] = React.useState<any>(null);
  const [unauthorized, setUnauthorized] = React.useState(false);

  React.useEffect(() => {
    async function resolveParams() {
      // If params is a promise (Next.js 15+), wait for it
      const resolved = initialParams instanceof Promise ? await initialParams : initialParams;
      
      if (resolved?.admin) {
        setAdminParams(resolved.admin);
      } else if (typeof window !== "undefined") {
        // Fallback to window.location if params are missing
        const path = window.location.pathname;
        const segments = path.split("/admin/").pop()?.split("/") || [];
        setAdminParams(segments.filter(Boolean));
      }
    }
    
    resolveParams();
  }, [initialParams]);

  const [segment, actionOrId] = adminParams;

  React.useEffect(() => {
    if (!config || !segment) return;
    const isCollection = config.collections.some((c: any) => c.name === segment);
    if (!isCollection) return;

    const query = queryStr ? `?${queryStr}` : "";

    if (!actionOrId) {
      fetch(`${apiBase}/${segment}${query}`)
        .then(async res => {
          if (res.status === 401) {
            setUnauthorized(true);
            return null;
          }
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        })
        .then(res => setData(res))
        .catch(e => console.error(`[AdminForge] Failed to fetch ${apiBase}/${segment}:`, e));
    } else if (actionOrId !== "new" && actionOrId !== "schema") {
      fetch(`${apiBase}/${segment}/${actionOrId}${query}`)
        .then(async res => {
          if (res.status === 401) {
            setUnauthorized(true);
            return null;
          }
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        })
        .then(res => setRecord(res))
        .catch(e => console.error(`[AdminForge] Failed to fetch ${apiBase}/${segment}/${actionOrId}:`, e));
    }
  }, [segment, actionOrId, apiBase, config, queryStr]);

  return (
    <AdminForgeProvider config={config} apiBase={apiBase}>
      <AdminDashboardContent 
        config={config} 
        adminParams={adminParams}
        unauthorized={unauthorized} 
        data={data}
        record={record}
      />
    </AdminForgeProvider>
  );
}

function AdminDashboardContent({ config: _config, adminParams, unauthorized: localUnauthorized, data, record }: any) {
  const { config: ctxConfig, unauthorized: ctxUnauthorized } = useAdminForge();
  const config = _config ?? ctxConfig;
  const session = useAdminSession();
  const noSession = config?.auth?.enabled && !session?.user;
  const unauthorized = localUnauthorized || ctxUnauthorized || noSession;

  if (unauthorized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '32px' }}>lock</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Login Required</h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>Please sign in to access the AdminForge dashboard.</p>
          <form action="/api/auth/signin" method="GET">
            <button className="adminforge-btn adminforge-btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px' }}>
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (config) {
    const [segment, actionOrId] = adminParams;

    if (adminParams.length === 0) return <AdminPage config={config} />;

    if (segment === "roles") {
      if (actionOrId) return <RoleDetailPage config={config} roleId={actionOrId} />;
      return <RolesListPage config={config} />;
    }

    if (segment === "settings" && actionOrId === "agent-tokens") {
      return <AgentTokenPage config={config} />;
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
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="adminforge-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Loading AdminForge...</p>
      </div>
      <style>{`
        .adminforge-spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
