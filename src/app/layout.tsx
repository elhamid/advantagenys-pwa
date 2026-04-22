import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { JsonLd } from "@/components/seo/JsonLd";
import { GTM, GTMNoScript } from "@/lib/analytics/gtm";

// Measurement env vars (all public; optional):
//   NEXT_PUBLIC_GTM_ID          — Google Tag Manager container (e.g. GTM-XXXXXXX)
//   NEXT_PUBLIC_META_PIXEL_ID   — Meta Pixel ID (loaded INSIDE GTM, not here)
//   NEXT_PUBLIC_GA4_ID          — GA4 Measurement ID (loaded INSIDE GTM)
//   NEXT_PUBLIC_CLARITY_ID      — Microsoft Clarity project ID (loaded INSIDE GTM)
// Vercel Analytics + Speed Insights autoload via env in Vercel.

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
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Advantage Business Consulting — Queens, NYC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advantage Services",
    description:
      "LLC, tax, licensing, ITIN, and audit defense for NYC businesses. IRS Certified Acceptance Agent.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Advantage Business Consulting — Queens, NYC",
      },
    ],
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
      <head>
        {/* Prevent Google/Chrome/Samsung Translate from crashing React.
            Translation wraps text nodes in <font> tags, which reparents them.
            React then calls removeChild/insertBefore on the wrong parent and throws.
            This patch makes those calls resilient to reparented nodes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if(typeof Node!=='undefined'){
  var oRC=Node.prototype.removeChild;
  Node.prototype.removeChild=function(c){
    if(c.parentNode!==this){
      if(c.parentNode)return c.parentNode.removeChild(c);
      return c;
    }
    return oRC.apply(this,arguments);
  };
  var oIB=Node.prototype.insertBefore;
  Node.prototype.insertBefore=function(n,r){
    if(r&&r.parentNode!==this)return this.appendChild(n);
    return oIB.apply(this,arguments);
  };
}`,
          }}
        />
        <GTM />
      </head>
      <body className="font-[family-name:var(--font-heading)] antialiased" suppressHydrationWarning>
        <GTMNoScript />
        {/* Skip-to-content link — WCAG AA */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[var(--blue-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          Skip to content
        </a>
        <ServiceWorkerRegistration />
        <LayoutShell>{children}</LayoutShell>
        <JsonLd type="LocalBusiness" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
