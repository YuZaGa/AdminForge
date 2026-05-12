"use client";

import type { CollectionDefinition, AccessConfig } from "@adminforge/core";
import Link from "next/link";

interface TableEngineProps {
  collection: CollectionDefinition;
  data: unknown[];
  basePath: string;
  role?: string;
}

function hasAccess(access: AccessConfig | undefined, operation: string, role?: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  if (!role) return false;
  return allowed.includes(role);
}

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

function ActivityCell({ record }: { record: Record<string, unknown> }) {
  const createdAtStr = (record.createdAt || record.created_at) as string;
  const updatedAtStr = (record.updatedAt || record.updated_at) as string;
  
  const createdAt = createdAtStr ? new Date(createdAtStr) : null;
  const updatedAt = updatedAtStr ? new Date(updatedAtStr) : null;
  
  const isUpdated = updatedAt && createdAt && updatedAt.getTime() > createdAt.getTime() + 1000;
  const date = isUpdated ? updatedAt : createdAt;
  const label = isUpdated ? "Updated" : "Created";
  
  if (!date) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>No activity</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
        <span 
          style={{ 
            fontSize: '10px', 
            padding: '1px 6px', 
            borderRadius: '10px',
            background: isUpdated ? '#fef3c7' : '#dcfce7',
            color: isUpdated ? '#92400e' : '#166534',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>
        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{formatRelativeTime(date)}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#64748b' }}>
        by <span style={{ color: '#0f172a', fontWeight: 600 }}>Admin</span>
      </div>
    </div>
  );
}

export function TableEngine({ collection, data, basePath, role }: TableEngineProps) {
  const records = data as Record<string, unknown>[];
  const fieldKeys = Object.keys(collection.fields);
  const displayKeys = ["id", ...fieldKeys.slice(0, 4)]; // Show up to 4 fields + ID + Activity
  const canDelete = hasAccess(collection.access, "delete", role);
  const canUpdate = hasAccess(collection.access, "update", role);

  return (
    <div className="adminforge-table-wrapper">
      <table className="adminforge-table">
        <thead>
          <tr>
            {displayKeys.map((key) => <th key={key}>{key}</th>)}
            <th>Activity</th>
            <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id as string}>
              {displayKeys.map((key) => (
                <td key={key}>
                  {key === 'id' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="adminforge-id-badge" title={String(record[key])}>
                        {String(record[key]).substring(0, 8)}...
                      </span>
                      <button 
                        type="button"
                        className="adminforge-btn-icon" 
                        style={{ width: '24px', height: '24px', minWidth: '24px' }}
                        title="Copy ID"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(String(record[key]));
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(record[key] ?? "")}
                    </div>
                  )}
                </td>
              ))}
              <td>
                <ActivityCell record={record} />
              </td>
              <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  {canUpdate && (
                    <Link href={`${basePath}/${record.id}`} className="adminforge-btn-icon" title="Edit">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      className="adminforge-btn-icon adminforge-btn-icon-danger"
                      title="Delete"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this item?")) {
                          const res = await fetch(`/api/${collection.name}/${record.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            window.location.reload();
                          } else {
                            const err = await res.json();
                            alert(err.error || "Failed to delete item");
                          }
                        }
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {records.length === 0 && <tr><td colSpan={displayKeys.length + 1}>No records found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
