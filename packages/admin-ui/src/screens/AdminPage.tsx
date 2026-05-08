import type { AdminForgeConfig } from "@adminforge/core";
import { AdminLayout } from "../components/AdminLayout.js";

interface AdminPageProps {
  config: AdminForgeConfig;
}

export function AdminPage({ config }: AdminPageProps) {
  return (
    <AdminLayout config={config} currentPath="/admin">
      <div className="adminforge-dashboard" style={{ display: "flex", gap: "2rem", marginTop: "20px" }}>
        
        {/* Left Column: Collections */}
        <div style={{ flex: 2 }}>
          <h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "20px", color: "#333" }}>
            Site administration
          </h2>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ background: "#417690", color: "#fff", padding: "10px 15px", fontWeight: "bold" }}>
              Collections
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {config.collections.map((collection) => (
                  <tr key={collection.name} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 15px" }}>
                      <a href={`/admin/${collection.name}`} style={{ color: "#417690", textDecoration: "none", fontWeight: "bold" }}>
                        {collection.label}
                      </a>
                    </td>
                    <td style={{ padding: "12px 15px", textAlign: "right" }}>
                      <a href={`/admin/${collection.name}/new`} style={{ color: "#999", textDecoration: "none", marginRight: "15px" }}>
                        <span style={{ color: "#417690", marginRight: "4px" }}>+</span> Add
                      </a>
                      <a href={`/admin/${collection.name}`} style={{ color: "#999", textDecoration: "none" }}>
                        <span style={{ color: "#417690", marginRight: "4px" }}>✎</span> Change
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Actions */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "#f8f8f8", border: "1px solid #eee", padding: "15px", borderRadius: "4px" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
              Recent actions
            </h3>
            <p style={{ color: "#666", fontStyle: "italic", fontSize: "14px" }}>My actions</p>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", color: "#444" }}>
              <li style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#417690", marginRight: "8px" }}>+</span>
                Created new Post
              </li>
              <li style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#417690", marginRight: "8px" }}>✎</span>
                Updated Category
              </li>
              <li style={{ padding: "8px 0", color: "#888", fontStyle: "italic" }}>
                (Placeholder for audit log)
              </li>
            </ul>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
