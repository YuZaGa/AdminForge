"use client";
import { useState, useEffect } from "react";
import type { AdminForgeConfig } from "../../core";
import { AdminLayout } from "../components/AdminLayout.js";
import Link from "next/link";
import { useAdminSession } from "../../auth/provider.js";

interface AdminPageProps {
  config: AdminForgeConfig;
  role?: string;
}

const iconMap: Record<string, string> = {
  posts: "article",
  categories: "category",
  tags: "sell",
  users: "person",
};

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (isNaN(date.getTime())) return "Invalid date";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function CollectionActivity({ activity }: { activity?: { createdAt: string, updatedAt: string } }) {
  if (!activity) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>;
  
  const createdAt = new Date(activity.createdAt);
  const updatedAt = new Date(activity.updatedAt);
  const isUpdated = updatedAt.getTime() > createdAt.getTime() + 1000;
  const date = isUpdated ? updatedAt : createdAt;
  const label = isUpdated ? "Updated" : "Created";

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <span 
        style={{ 
          fontSize: '9px', 
          padding: '1px 6px', 
          borderRadius: '10px',
          background: isUpdated ? '#fef3c7' : '#92400e20',
          color: isUpdated ? '#92400e' : '#166534',
          fontWeight: 700,
          textTransform: 'uppercase',
          border: '1px solid',
          borderColor: isUpdated ? '#fde68a' : '#bbf7d0'
        }}
      >
        {label}
      </span>
      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{formatRelativeTime(date)}</span>
    </div>
  );
}

export function AdminPage({ config, role: propRole }: AdminPageProps) {
  const session = useAdminSession();
  const role = propRole || session.role || session.user?.role;
  const schemaActivity = config.collections?.[0] && (config.collections[0] as any)?.schemaActivity;

  return (
    <AdminLayout config={config} currentPath="/admin" role={role}>
      <div className="adminforge-dashboard">
        <div className="mb-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h2 className="adminforge-display-title" style={{ marginBottom: 0 }}>Collection Registry</h2>
          </div>
          <p className="adminforge-display-subtitle" style={{ marginBottom: '32px' }}>
            Index of all data models defined in your system.
          </p>
        </div>

        {schemaActivity && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '12px 20px', 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '12px', 
            marginBottom: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px' }}>sync</span>
            <div style={{ fontSize: '14px', color: '#0369a1' }}>
              <span style={{ fontWeight: 600 }}>Schema Synced:</span> Your definitions from <code style={{ background: '#e0f2fe', padding: '2px 4px', borderRadius: '4px' }}>adminforge.ts</code> were last updated <span style={{ fontWeight: 500 }}>{formatRelativeTime(new Date(schemaActivity.updatedAt))}</span>
            </div>
          </div>
        )}

        <div className="adminforge-table-wrapper">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Registered Collections</h3>
          </div>
          <table className="adminforge-table">
            <thead>
              <tr>
                <th style={{ width: 'auto' }}>Collection Name</th>
                <th style={{ width: '180px' }}>Field Definitions</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {config.collections
                .filter((collection) => {
                  const a = collection.access;
                  return !a?.read || !role || a.read.includes(role);
                })
                .map((collection) => {
                  return (
                    <tr key={collection.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                              {collection.icon || 'database'}
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '15px' }}>{collection.label}</span>
                        </div>
                      </td>
                      <td>
                        <span className="adminforge-badge adminforge-badge-secondary" style={{ padding: '4px 10px' }}>
                          {Object.keys(collection.fields).length} mapped fields
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link href={`/admin/${collection.name}`} className="adminforge-btn-icon" title="View Data">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>database</span>
                          </Link>
                          <Link href={`/admin/${collection.name}/schema`} className="adminforge-btn-icon" title="View Schema">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div style={{ padding: '20px 24px', background: '#fcfcfd', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Showing {config.collections.length} models from your current configuration.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
