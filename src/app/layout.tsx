import type { Metadata, Manifest } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Habits Class: Daily Devotional",
  description: "Weekly Bible reading, S.O.A.P. journaling, prayer, and memory verse tracking",
  manifest: "/habits-pwa/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habits Class",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="midnight-gold">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)" />
        <meta name="description" content="Weekly Bible reading, S.O.A.P. journaling, prayer, and memory verse tracking" />
        <link rel="apple-touch-icon" href="/habits-pwa/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('habitsTheme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){console.warn('[Habits] Theme read failed:',e)}})()`,
          }}
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
