import { AdminForgeProvider, AuthProvider } from "@adminforge/core/ui";
import { auth } from "../../lib/auth";
import "@adminforge/core/styles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AuthProvider session={session as any}>
      <AdminForgeProvider>
        {children}
      </AdminForgeProvider>
    </AuthProvider>
  );
}
