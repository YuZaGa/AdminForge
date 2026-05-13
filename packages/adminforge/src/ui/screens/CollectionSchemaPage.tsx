"use client";

import type { AdminForgeConfig, CollectionDefinition, FieldDefinition } from "../../core";
import { AdminLayout } from "../components/AdminLayout.js";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CollectionSchemaPageProps {
  config: AdminForgeConfig;
  collection: CollectionDefinition;
  role?: string;
}

function formatFullTimestamp(date: Date) {
  if (isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function CollectionSchemaPage({ config, collection, role }: CollectionSchemaPageProps) {
  const [lastActivity, setLastActivity] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`/api/${collection.name}?pageSize=1`)
      .then(res => res.json())
      .then(result => {
        const item = result.data?.[0];
        if (item) {
          const dateStr = item.updatedAt || item.updated_at || item.createdAt || item.created_at;
          if (dateStr) {
            setLastActivity(formatFullTimestamp(new Date(dateStr)));
          } else {
            setLastActivity("No date info");
          }
        } else {
          setLastActivity("No activity");
        }
      })
      .catch(() => setLastActivity("Unknown"));
  }, [collection.name]);

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text": return "text_fields";
      case "slug": return "link";
      case "richText": return "description";
      case "boolean": return "toggle_on";
      case "image": return "image";
      case "relation": return "account_tree";
      case "date": return "calendar_today";
      default: return "label";
    }
  };

  return (
    <AdminLayout config={config} currentPath={`/admin/${collection.name}`} role={role}>
      <div className="adminforge-schema-page">
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              Back to Collection Registry
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 700 }}>{collection.label} Schema</h1>
              <span className="adminforge-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}>
                defined in adminforge.ts
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          <div className="adminforge-card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Field Definitions</h3>
            </div>
            <table className="adminforge-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>FIELD NAME</th>
                  <th style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>TYPE</th>
                  <th style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>PROPERTIES</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(collection.fields).map(([name, field]) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 600 }}>{name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>
                          {getFieldIcon(field.type)}
                        </span>
                        <span>{field.type}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {field.meta?.required && <span className="adminforge-badge adminforge-badge-danger" style={{ fontSize: '11px' }}>required</span>}
                        {field.meta?.unique && <span className="adminforge-badge adminforge-badge-primary" style={{ fontSize: '11px' }}>unique</span>}
                        {!!field.ui.props?.from && <span className="adminforge-badge adminforge-badge-secondary" style={{ fontSize: '11px' }}>from: {String(field.ui.props.from)}</span>}
                        {!!field.ui.props?.to && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px' }}>to: <strong>{String(field.ui.props.to)}</strong></span>
                            <span className="adminforge-badge adminforge-badge-secondary" style={{ fontSize: '10px', alignSelf: 'flex-start' }}>{String(field.ui.props.relationType)}</span>
                          </div>
                        )}
                        {field.meta?.default !== undefined && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>default: <code>{JSON.stringify(field.meta.default)}</code></span>}
                        {!field.meta?.required && !field.meta?.unique && !field.ui.props?.from && !field.ui.props?.to && <span style={{ color: 'var(--color-text-secondary)' }}>-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="adminforge-card" style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-text-secondary)' }}>info</span>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Collection Meta</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Collection Name</label>
              <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{collection.name}</code>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>UI Label</label>
              <span style={{ fontSize: '16px', fontWeight: 500 }}>{collection.label}</span>
            </div>

            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Last Activity</label>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{lastActivity}</span>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Access Rules</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Create</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(collection.access?.create || ['admin']).map(role => (
                      <span key={role} className="adminforge-badge adminforge-badge-secondary" style={{ fontSize: '11px' }}>{role}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Update</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(collection.access?.update || ['admin']).map(role => (
                      <span key={role} className="adminforge-badge adminforge-badge-secondary" style={{ fontSize: '11px' }}>{role}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Delete</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(collection.access?.delete || ['admin']).map(role => (
                      <span key={role} className="adminforge-badge adminforge-badge-danger" style={{ fontSize: '11px', background: '#fee2e2', color: '#b91c1c' }}>{role}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
