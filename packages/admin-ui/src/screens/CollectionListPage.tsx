"use client";

import type { AdminForgeConfig, CollectionDefinition, AccessConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";
import { TableEngine } from "../table-engine/TableEngine.js";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CollectionListPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  data: unknown[];
  total: number;
  page: number;
  pageSize: number;
  role?: string;
}

function hasAccess(access: AccessConfig | undefined, operation: string, role?: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  if (!role) return false;
  return allowed.includes(role);
}

export function CollectionListPage({ config, collection, data, total, page, pageSize, role }: CollectionListPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const canCreate = hasAccess(collection.access, "create", role);

  const updateParams = useCallback((newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/admin/${collection.name}?${params.toString()}`);
  }, [collection.name, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchQuery, page: 1 });
  };

  const totalPages = Math.ceil(total / pageSize);
  const startEntry = (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`} role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{collection.label}</h2>
            <span className="adminforge-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}>
              {total} total records
            </span>
          </div>
          {canCreate && (
            <Link href={`/admin/${collection.name}/new`} className="adminforge-btn adminforge-btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>add</span>
              Create New
            </Link>
          )}
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: '#fcfcfd' }}>
            <form onSubmit={handleSearch} style={{ maxWidth: '400px', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                className="adminforge-search-input" 
                placeholder={`Search ${(collection.label || collection.name).toLowerCase()}...`} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </form>
          </div>

          <TableEngine collection={collection} data={data} basePath={`/admin/${collection.name}`} role={role} />

          {/* Pagination Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Showing <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{startEntry}</span> to <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{endEntry}</span> of <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{total}</span> results
              </div>
              <select 
                value={pageSize} 
                onChange={(e) => updateParams({ pageSize: e.target.value, page: 1 })}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '12px',
                  background: 'white',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {[10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => updateParams({ page: page - 1 })}
                disabled={page <= 1}
                className="adminforge-btn-icon"
                style={{ border: '1px solid var(--color-border)', background: 'white' }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                // Simple logic to show only current, first, last and surrounding pages if many
                if (totalPages > 7 && p > 1 && p < totalPages && Math.abs(p - page) > 1) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} style={{ padding: '0 4px' }}>...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: p })}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: p === page ? 'var(--color-primary)' : 'var(--color-border)',
                      background: p === page ? 'var(--color-primary)' : 'white',
                      color: p === page ? 'white' : 'var(--color-text)',
                      fontWeight: p === page ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button 
                onClick={() => updateParams({ page: page + 1 })}
                disabled={page >= totalPages}
                className="adminforge-btn-icon"
                style={{ border: '1px solid var(--color-border)', background: 'white' }}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
