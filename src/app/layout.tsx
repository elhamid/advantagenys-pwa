import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { JsonLd } from "@/components/seo/JsonLd";

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
      </head>
      <body className="font-[family-name:var(--font-heading)] antialiased" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <LayoutShell>{children}</LayoutShell>
        <JsonLd type="LocalBusiness" />
      </body>
    </html>
  );
}
