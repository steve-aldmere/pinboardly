// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: {
    default: "Pinboardly",
    template: "%s · Pinboardly",
  },
  description: "Simple boards for groups, teams, and organisations.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted text-foreground">
        <Script
          defer
          data-domain="pinboardly.com"
          src="https://plausible.io/js/script.js"
        />
        <TopNav />
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
