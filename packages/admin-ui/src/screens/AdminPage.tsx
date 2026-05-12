"use client";
import { useState, useEffect } from "react";
import type { AdminForgeConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import Link from "next/link";

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

function CollectionActivity({ name }: { name: string }) {
  const [activity, setActivity] = useState<{ label: string, time: string, isUpdated: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/${name}?pageSize=1`)
      .then(res => res.json())
      .then(result => {
        const item = result.data?.[0];
        if (item) {
          const createdAtStr = (item.createdAt || item.created_at) as string;
          const updatedAtStr = (item.updatedAt || item.updated_at) as string;
          const createdAt = createdAtStr ? new Date(createdAtStr) : null;
          const updatedAt = updatedAtStr ? new Date(updatedAtStr) : null;
          
          const isUpdated = updatedAt && createdAt && updatedAt.getTime() > createdAt.getTime() + 1000;
          const date = isUpdated ? updatedAt : createdAt;
          
          setActivity({
            label: isUpdated ? "Updated" : "Created",
            time: date ? formatRelativeTime(date) : "Unknown",
            isUpdated: !!isUpdated
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</span>;
  if (!activity) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>No activity</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
        <span 
          style={{ 
            fontSize: '9px', 
            padding: '0px 5px', 
            borderRadius: '10px',
            background: activity.isUpdated ? '#fef3c7' : '#dcfce7',
            color: activity.isUpdated ? '#92400e' : '#166534',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          {activity.label}
        </span>
        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{activity.time}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#64748b' }}>
        by <span style={{ color: '#0f172a', fontWeight: 600 }}>Admin</span>
      </div>
    </div>
  );
}

export function AdminPage({ config, role }: AdminPageProps) {
  return (
    <AdminLayout config={config} currentPath="/admin" role={role}>
      <div className="adminforge-dashboard">
        <div className="mb-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h2 className="adminforge-display-title" style={{ marginBottom: 0 }}>Collection Registry</h2>
            <span className="adminforge-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}>
              defined in adminforge.ts
            </span>
          </div>
          <p className="adminforge-display-subtitle">
            Overview of all data collections in the system.
          </p>
          <br></br>
        </div>

        <div className="adminforge-table-wrapper">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Registered Collections</h3>
          </div>
          <table className="adminforge-table">
            <thead>
              <tr>
                <th style={{ width: 'auto' }}>Collection Name</th>
                <th style={{ width: '140px' }}>Field Count</th>
                <th style={{ width: '220px' }}>Last Activity</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
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
                        <span style={{ fontWeight: 600 }}>{collection.label}</span>
                      </td>
                      <td>
                        <span className="adminforge-badge adminforge-badge-secondary">
                          {Object.keys(collection.fields).length} fields
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        <CollectionActivity name={collection.name} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/admin/${collection.name}/schema`} className="adminforge-btn-icon" title="View Schema">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Showing {config.collections.length} of {config.collections.length} registered collections
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
