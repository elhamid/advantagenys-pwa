import type { Metadata } from "next";
import TVSlider from "./TVSlider";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Advantage Services",
  robots: { index: false, follow: false },
  alternates: { canonical: makeCanonical("/tv") },
};

const PRELOAD_IMAGES = [
  "/images/office-exterior-hd.jpg",
  "/images/team/kedar.jpg",
  "/images/team/jay-v2.jpg",
  "/images/team/zia.jpg",
  "/images/team/akram.jpg",
  "/images/team/riaz-v7.jpg",
  "/images/team/hamid-v11.png",
  "/images/qr-advantagenys.png",
];

export default function TVPage() {
  return (
    <>
      {PRELOAD_IMAGES.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <main style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0A0F1A' }}>
        <TVSlider />
      </main>
    </>
  );
}
