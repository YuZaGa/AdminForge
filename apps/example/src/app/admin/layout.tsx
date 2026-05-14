import { AdminForgeProvider } from "@adminforge/core/ui";
import "@adminforge/core/styles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminForgeProvider>
      {children}
    </AdminForgeProvider>
  );
}
