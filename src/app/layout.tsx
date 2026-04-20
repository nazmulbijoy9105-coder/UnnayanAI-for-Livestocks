import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

export const metadata: Metadata = {
  title: "UnnayanAI - Smart Dairy AI & IoT Platform",
  description: "Bangladesh-first Smart Dairy AI platform for farmers, NGOs, MFIs and investors",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "UnnayanAI" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "UnnayanAI",
    description: "Smart Dairy AI & IoT Platform",
    siteName: "UnnayanAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
