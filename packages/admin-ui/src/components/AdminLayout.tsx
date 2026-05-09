import type { AdminForgeConfig } from "@adminforge/core";
import Link from "next/link";

interface AdminLayoutProps {
  config: AdminForgeConfig;
  children: React.ReactNode;
  currentPath?: string;
  role?: string;
}

export function AdminLayout({ config, children, currentPath, role }: AdminLayoutProps) {
  return (
    <div className="adminforge-layout">
      <nav className="adminforge-sidebar">
        <div className="adminforge-sidebar-header">
          <Link href="/admin"><h1>AdminForge</h1></Link>
        </div>
        <ul className="adminforge-nav">
          {config.collections.map((collection) => {
            const a = collection.access;
            if (a?.read && role && !a.read.includes(role)) return null;
            const href = `/admin/${collection.name}`;
            return (
              <li key={collection.name}>
                <Link href={href} className={currentPath === href ? "active" : ""}>
                  {collection.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="adminforge-content">
        <header className="adminforge-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#333" }}>Dashboard</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {role && <span style={{ fontSize: "13px", color: "#666" }}>{role}</span>}
            {config.auth?.enabled && (
              <form action="/api/logout" method="POST">
                <button type="submit" className="adminforge-btn adminforge-btn-secondary" style={{ cursor: "pointer" }}>Log Out</button>
              </form>
            )}
          </div>
        </header>
        <div style={{ padding: "0 24px" }}>{children}</div>
      </main>
    </div>
  );
}
