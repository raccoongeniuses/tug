import type { Metadata } from "next";
import { Providers } from "@/providers/query-provider";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness Package Admin",
  description: "Manage wellness packages",
};

function Navbar() {
  return (
    <header style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1024,
        margin: "0 auto",
        padding: "0 1.5rem",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
          }}>
            T
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>
              Tug Admin
            </span>
            <span style={{
              display: "block",
              fontSize: 11,
              color: "var(--color-text-muted)",
              fontWeight: 400,
              lineHeight: 1,
            }}>
              Wellness Packages
            </span>
          </div>
        </Link>
        <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/" style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-primary)",
            background: "var(--color-primary-bg)",
            transition: "all var(--transition)",
          }}>
            Packages
          </Link>
          <Link href="/packages/new" style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: "var(--radius-sm)",
            color: "white",
            background: "var(--color-primary)",
            transition: "all var(--transition)",
          }}>
            + New
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
