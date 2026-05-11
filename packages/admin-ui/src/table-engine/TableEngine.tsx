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

export function TableEngine({ collection, data, basePath, role }: TableEngineProps) {
  const records = data as Record<string, unknown>[];
  const fieldKeys = Object.keys(collection.fields);
  const displayKeys = ["id", ...fieldKeys.slice(0, 5)];
  const canDelete = hasAccess(collection.access, "delete", role);
  const canUpdate = hasAccess(collection.access, "update", role);

  return (
    <div className="adminforge-table-wrapper">
      <table className="adminforge-table">
        <thead>
          <tr>
            {displayKeys.map((key) => <th key={key}>{key}</th>)}
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
                    String(record[key] ?? "")
                  )}
                </td>
              ))}
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
