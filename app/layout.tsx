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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {GA_ID ? (
          <>
            <Script
              id="gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-screen bg-muted text-foreground">
        <TopNav />
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
