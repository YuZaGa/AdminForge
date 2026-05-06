import type { AdminForgeConfig } from "@adminforge/core";

interface AdminLayoutProps {
  config: AdminForgeConfig;
  children: React.ReactNode;
  currentPath?: string;
}

export function AdminLayout({ config, children, currentPath }: AdminLayoutProps) {
  return (
    <div className="adminforge-layout">
      <nav className="adminforge-sidebar">
        <div className="adminforge-sidebar-header">
          <h1>AdminForge</h1>
        </div>
        <ul className="adminforge-nav">
          {config.collections.map((collection) => {
            const href = `/admin/${collection.name}`;
            const isActive = currentPath === href;
            return (
              <li key={collection.name}>
                <a
                  href={href}
                  className={isActive ? "active" : ""}
                >
                  {collection.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="adminforge-content">
        {children}
      </main>
    </div>
  );
}
