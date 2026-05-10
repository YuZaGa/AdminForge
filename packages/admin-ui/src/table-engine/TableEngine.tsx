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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id as string}>
              {displayKeys.map((key) => <td key={key}>{String(record[key] ?? "")}</td>)}
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canUpdate && (
                    <Link href={`${basePath}/${record.id}`} className="adminforge-btn adminforge-btn-secondary">
                      Edit
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      className="adminforge-btn adminforge-btn-danger"
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
                      Delete
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
