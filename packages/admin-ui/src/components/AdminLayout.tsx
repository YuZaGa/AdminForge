import type { AdminForgeConfig } from "@adminforge/core";
import Link from "next/link";

interface AdminLayoutProps {
  config: AdminForgeConfig;
  children: React.ReactNode;
  currentPath?: string;
  role?: string;
}

const iconMap: Record<string, string> = {
  posts: "article",
  categories: "category",
  tags: "sell",
  users: "person",
};

export function AdminLayout({ config, children, currentPath, role }: AdminLayoutProps) {
  return (
    <div className="adminforge-layout">
      <nav className="adminforge-sidebar">
        <div className="adminforge-sidebar-header">
          <Link href="/admin">
            <h1>AdminForge</h1>
          </Link>
          <p className="adminforge-sidebar-subtitle">Collections Manager</p>
        </div>
        <ul className="adminforge-nav">
          <li>
            <Link href="/admin" className={`adminforge-nav-link ${currentPath === "/admin" ? "active" : ""}`}>
              <div className="adminforge-nav-item-content">
                <span className="material-symbols-outlined adminforge-nav-icon">dashboard</span>
                <span>Overview</span>
              </div>
            </Link>
          </li>
          {config.collections.map((collection) => {
            const a = collection.access;
            if (a?.read && role && !a.read.includes(role)) return null;
            const href = `/admin/${collection.name}`;
            const icon = iconMap[collection.name] || "database";
            return (
              <li key={collection.name} className="adminforge-nav-item">
                <Link href={href} className={`adminforge-nav-link ${currentPath === href ? "active" : ""}`}>
                  <div className="adminforge-nav-item-content">
                    <span className="material-symbols-outlined adminforge-nav-icon">{icon}</span>
                    <span>{collection.label}</span>
                  </div>
                </Link>
                <Link href={`${href}/new`} className="adminforge-nav-quick-create" title={`Create New ${collection.label}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="adminforge-content">
        <header className="adminforge-topbar">
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
            {currentPath === "/admin" ? "Dashboard" : "Management"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {role && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)" }}>{role}</span>
              </div>
            )}
            {config.auth?.enabled && (
              <form action="/api/logout" method="POST">
                <button type="submit" className="adminforge-btn adminforge-btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                  Log Out
                </button>
              </form>
            )}
          </div>
        </header>
        <div className="adminforge-main-canvas">{children}</div>
      </main>
    </div>
  );
}
