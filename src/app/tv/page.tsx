import type { Metadata } from "next";
import TVSlider from "./TVSlider";

export const metadata: Metadata = {
  title: "Advantage Services",
  robots: { index: false, follow: false },
};

const PRELOAD_IMAGES = [
  "/images/office-exterior-hd.jpg",
  "/images/team/kedar.jpg",
  "/images/team/jay-v2.jpg",
  "/images/team/zia.jpg",
  "/images/team/akram.jpg",
  "/images/team/riaz-v7.jpg",
  "/images/team/hamid-v11.jpg",
  "/images/qr-advantagenys.png",
];

export default function TVPage() {
  return (
    <>
      {PRELOAD_IMAGES.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <main className="h-screen w-screen overflow-hidden bg-[#0A0F1A]">
        <TVSlider />
      </main>
    </>
  );
}
