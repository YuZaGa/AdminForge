import type { AdminForgeConfig } from "@adminforge/core";
import Link from "next/link";

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
          <Link href="/admin">
            <h1>AdminForge</h1>
          </Link>
        </div>
        <ul className="adminforge-nav">
          {config.collections.map((collection) => {
            const href = `/admin/${collection.name}`;
            const isActive = currentPath === href;
            return (
              <li key={collection.name}>
                <Link
                  href={href}
                  className={isActive ? "active" : ""}
                >
                  {collection.label}
                </Link>
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
