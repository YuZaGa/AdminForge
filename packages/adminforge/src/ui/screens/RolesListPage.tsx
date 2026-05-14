"use client";

import type { AdminForgeConfig } from "../../core";
import { AdminLayout } from "../components/AdminLayout.js";
import Link from "next/link";

interface RolesListPageProps {
  config: AdminForgeConfig;
  role?: string;
}

export function RolesListPage({ config, role }: RolesListPageProps) {
  const roles = Object.entries(config.auth?.roles || {});

  return (
    <AdminLayout config={config} currentPath="/admin/roles" role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Roles</h2>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table className="adminforge-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fcfcfd', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Name</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Label</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(([key, roleDef]) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--color-text)', fontWeight: 500 }}>
                    <code>{key}</code>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {roleDef.label}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link 
                      href={`/admin/roles/${key}`} 
                      className="adminforge-btn adminforge-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      View Permissions
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
