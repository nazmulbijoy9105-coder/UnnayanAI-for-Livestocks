import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnnayanAI for Livestocks | Smart Dairy AI & IoT Platform",
  description: "AI-powered dairy farming platform for Bangladesh farmers. Smart monitoring, predictive analytics, and IoT automation for increased milk yield and cattle health.",
  keywords: ["AI", "Dairy", "Livestock", "IoT", "Smart Farming", "Bangladesh", "Milk Production"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-emerald-50 via-white to-cyan-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
