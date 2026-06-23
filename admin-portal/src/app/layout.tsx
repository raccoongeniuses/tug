import type { Metadata } from "next";
import { Providers } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness Package Admin",
  description: "Manage wellness packages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
