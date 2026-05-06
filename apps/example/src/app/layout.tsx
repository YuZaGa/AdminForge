import type { Metadata } from "next";
import "./styles/adminforge.css";

export const metadata: Metadata = {
  title: "AdminForge Example",
  description: "Example app using AdminForge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
