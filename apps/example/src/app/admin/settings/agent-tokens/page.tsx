"use client";

import { useState } from "react";
import { AdminLayout } from "@adminforge/admin-ui";
import type { AdminForgeConfig } from "@adminforge/core";
import { useConfig } from "../../../../lib/use-config";

export default function AgentTokensPage() {
  const { config, session, loading: configLoading } = useConfig();
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState(600); // Default 10 min
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: selectedScopes, expiresIn }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        alert(data.error || "Failed to generate token");
      }
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) return <div className="adminforge-loading">Loading...</div>;
  if (!config) return <div className="adminforge-loading">Failed to load config</div>;

  const forgeConfig = config as unknown as AdminForgeConfig;
  const role = (session as { role?: string })?.role;

  return (
    <AdminLayout config={forgeConfig} currentPath="/admin/settings/agent-tokens" role={role}>
      <div className="adminforge-collection-page">
        <div className="adminforge-page-header" style={{ marginBottom: '40px' }}>
          <div>
            <h1 className="adminforge-display-title">Agent Token Generator</h1>
            <p className="adminforge-display-subtitle">Issue secure, scoped passes for your AI agents.</p>
          </div>
        </div>

        {token ? (
          <div className="adminforge-form" style={{ maxWidth: '100%', borderColor: '#10b981', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '32px' }}>verified_user</span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b' }}>Token Generated Successfully</h2>
            </div>
            
            <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #10b98140' }}>
              <p style={{ fontSize: '14px', color: '#166534', lineHeight: 1.6 }}>
                <strong>⚠️ Security Alert:</strong> Copy this token now. It is never stored and will only be shown once. 
              It will expire in <strong>{expiresIn / 60} minutes</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                readOnly 
                value={token} 
                className="adminforge-input"
                style={{ fontFamily: 'monospace', fontSize: '12px', flex: 1, height: '48px' }}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(token);
                  alert("Copied to clipboard!");
                }}
                className="adminforge-btn adminforge-btn-primary"
                style={{ height: '48px', padding: '0 24px' }}
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copy
              </button>
            </div>
            
            <button 
              onClick={() => setToken(null)}
              className="adminforge-btn-text"
              style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              Generate another token
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="adminforge-table-wrapper">
              <table className="adminforge-table">
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th style={{ textAlign: 'center' }}>Create</th>
                    <th style={{ textAlign: 'center' }}>Read</th>
                    <th style={{ textAlign: 'center' }}>Update</th>
                    <th style={{ textAlign: 'center' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {forgeConfig.collections.map(c => (
                    <tr key={c.name}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>{c.icon || 'database'}</span>
                          {c.label}
                        </div>
                      </td>
                      {["create", "read", "update", "delete"].map(action => {
                        const scope = `${c.name}:${action}`;
                        return (
                          <td key={action} style={{ textAlign: 'center' }}>
                            <div className="adminforge-field-checkbox" style={{ justifyContent: 'center' }}>
                              <input 
                                type="checkbox"
                                checked={selectedScopes.includes(scope)}
                                onChange={() => toggleScope(scope)}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)', marginBottom: '8px' }}>
                    {selectedScopes.length} scopes selected
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { label: '10m', val: 600 },
                      { label: '30m', val: 1800 },
                      { label: '1h', val: 3600 }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setExpiresIn(opt.val)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid',
                          background: expiresIn === opt.val ? 'var(--color-primary)' : '#fff',
                          color: expiresIn === opt.val ? '#fff' : 'var(--color-text)',
                          borderColor: expiresIn === opt.val ? 'var(--color-primary)' : 'var(--color-border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Token will expire in {expiresIn / 60} minutes.
                </p>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading || selectedScopes.length === 0}
                className="adminforge-btn adminforge-btn-primary"
                style={{ padding: '12px 32px', fontSize: '15px' }}
              >
                {loading ? "Generating..." : "Generate Agent Token"}
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Security Protocol
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Short-Lived Keys</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Tokens expire after 10 minutes. This reduces the risk of long-term credential leakage.
                  </p>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Scoped Authority</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Agents are strictly limited to the checkboxes above. They cannot bypass RBAC rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
