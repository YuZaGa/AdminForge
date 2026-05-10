"use client";

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

export function AdminPage({ config, role }: AdminPageProps) {
  return (
    <AdminLayout config={config} currentPath="/admin" role={role}>
      <div className="adminforge-dashboard">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="adminforge-display-title">Model Registry</h2>
            <p className="adminforge-display-subtitle">Define and manage your system's data architecture.</p>
          </div>
          <button className="adminforge-btn adminforge-btn-secondary" style={{ padding: '12px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
            Import Schema
          </button>
        </div>

        <div className="adminforge-table-wrapper">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Registered Collections</h3>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                className="adminforge-input" 
                placeholder="Search models..." 
                style={{ paddingLeft: '40px', width: '260px', height: '40px' }}
              />
            </div>
          </div>
          <table className="adminforge-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fields</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {config.collections
                .filter((collection) => {
                  const a = collection.access;
                  return !a?.read || !role || a.read.includes(role);
                })
                .map((collection) => {
                  const icon = iconMap[collection.name] || "database";
                  return (
                    <tr key={collection.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{icon}</span>
                          <span style={{ fontWeight: 600 }}>{collection.label}</span>
                          <span className="adminforge-badge">Collection</span>
                        </div>
                      </td>
                      <td>
                        <span className="adminforge-badge adminforge-badge-secondary">
                          {Object.keys(collection.fields).length} fields
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                          <span style={{ fontSize: '13px' }}>Active</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>2 hours ago</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/admin/${collection.name}`} className="adminforge-btn-text">
                          Edit Schema
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Showing {config.collections.length} of {config.collections.length} registered models
            </p>
            <button className="adminforge-btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
              Register New Collection
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
