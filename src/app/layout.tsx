import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";

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
    default: "AdvantageOS",
    template: "%s · AdvantageOS",
  },
  description:
    "One Stop-Shop For All Business Solutions. LLC formation, licensing, tax prep, insurance, and audit defense. 20+ years serving NYC businesses. IRS Certified Acceptance Agent.",
  metadataBase: new URL("https://advantagenys.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AdvantageOS",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4F56E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-[family-name:var(--font-heading)] antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
