import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Advantage Services",
    template: "%s · Advantage Services",
  },
  description:
    "One Stop-Shop For All Business Solutions. LLC formation, licensing, tax prep, insurance, and audit defense. 20+ years serving NYC businesses. IRS Certified Acceptance Agent.",
  metadataBase: new URL("https://advantagenys.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Advantage Services",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-32.png",
    apple: "/icons/apple-touch-icon.png",
  },
  // Apple PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Advantage Services",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F56E8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-[family-name:var(--font-heading)] antialiased">
        <ServiceWorkerRegistration />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
