"use client";

import type { AdminForgeConfig, CollectionDefinition } from "../../core";
import { AdminLayout } from "../components/AdminLayout.js";
import { FormEngine } from "../form-engine/FormEngine.js";
import Link from "next/link";

interface CollectionFormPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  record?: Record<string, unknown> | null;
  isNew: boolean;
  role?: string;
}

function formatDate(date: Date) {
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export function CollectionFormPage({ config, collection, record, isNew, role }: CollectionFormPageProps) {
  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`} role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{isNew ? `Create ${collection.label}` : `Edit ${collection.label}`}</h2>
            {!isNew && (
              <span className="adminforge-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0', fontSize: '11px' }}>
                ID: {String(record?.id).substring(0, 8)}...
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isNew && (
              <button
                className="adminforge-btn adminforge-btn-danger"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this item?")) {
                    const res = await fetch(`/api/${collection.name}/${record?.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      window.location.href = `/admin/${collection.name}`;
                    } else {
                      const err = await res.json();
                      alert(err.error || "Failed to delete item");
                    }
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>delete</span>
                Delete
              </button>
            )}
            <Link href={`/admin/${collection.name}`} className="adminforge-btn adminforge-btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>arrow_back</span>
              Back
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FormEngine collection={collection} record={record} isNew={isNew} role={role} />
          
          {!isNew && record && (
            <div style={{ 
              padding: '24px', 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#64748b', 
                marginBottom: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>info</span>
                System Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Created</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 500 }}>Admin</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {record.createdAt ? formatDate(new Date(record.createdAt as string)) : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Last Updated</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 500 }}>Admin</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {(record.updatedAt || record.createdAt) ? formatDate(new Date((record.updatedAt || record.createdAt) as string)) : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
