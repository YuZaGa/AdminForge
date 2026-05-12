"use client";

import type { AdminForgeConfig, CollectionDefinition, AccessConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import Link from "next/link";

interface RoleDetailPageProps {
  config: AdminForgeConfig;
  roleId: string;
  role?: string;
}

function hasAccess(access: AccessConfig | undefined, operation: string, roleName: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  return allowed.includes(roleName);
}

export function RoleDetailPage({ config, roleId, role }: RoleDetailPageProps) {
  const roleDef = config.auth?.roles?.[roleId];
  if (!roleDef) {
    return (
      <AdminLayout config={config} currentPath="/admin/roles" role={role}>
        <div className="adminforge-collection-page">
          <div className="adminforge-page-header">
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Role not found</h2>
          </div>
          <Link href="/admin/roles" className="adminforge-btn adminforge-btn-secondary">Back to Roles</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout config={config} currentPath="/admin/roles" role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/admin/roles" className="adminforge-btn-icon" style={{ border: '1px solid var(--color-border)', background: 'white' }}>
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Role: {roleDef.label || roleId}</h2>
          </div>
          <div className="adminforge-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}>
            Read-only Config
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text)' }}>Permissions Matrix</h3>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table className="adminforge-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fcfcfd', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Read</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {config.collections.map((collection) => {
                  const canRead = hasAccess(collection.access, 'read', roleId);
                  const canCreate = hasAccess(collection.access, 'create', roleId);
                  const canUpdate = hasAccess(collection.access, 'update', roleId);
                  const canDelete = hasAccess(collection.access, 'delete', roleId);

                  return (
                    <tr key={collection.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {collection.label || collection.name}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <PermissionStatus allowed={canRead} />
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <PermissionStatus allowed={canCreate} />
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <PermissionStatus allowed={canUpdate} />
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <PermissionStatus allowed={canDelete} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text)' }}>Field-Level Overrides</h3>
          {config.collections.map((collection) => {
            const fieldsWithAccess = Object.entries(collection.fields).filter(([_, field]) => field.access);
            if (fieldsWithAccess.length === 0) return null;

            return (
              <div key={collection.name} style={{ marginBottom: '24px', padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'white' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-secondary)' }}>{collection.label || collection.name}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                  {fieldsWithAccess.map(([name, field]) => {
                    const canRead = hasAccess(field.access, 'read', roleId);
                    const canCreate = hasAccess(field.access, 'create', roleId);
                    const canUpdate = hasAccess(field.access, 'update', roleId);

                    return (
                      <div key={name} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}><code>{name}</code></div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: canRead ? '#10b981' : '#ef4444' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{canRead ? 'check_circle' : 'cancel'}</span> read
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: canCreate ? '#10b981' : '#ef4444' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{canCreate ? 'check_circle' : 'cancel'}</span> create
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: canUpdate ? '#10b981' : '#ef4444' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{canUpdate ? 'check_circle' : 'cancel'}</span> update
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function PermissionStatus({ allowed }: { allowed: boolean }) {
  return (
    <span className="material-symbols-outlined" style={{ 
      color: allowed ? '#10b981' : '#ef4444',
      fontSize: '20px',
      fontWeight: 'bold'
    }}>
      {allowed ? 'check' : 'close'}
    </span>
  );
}
