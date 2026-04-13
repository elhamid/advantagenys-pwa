import type { Metadata } from "next";
import TVSlider from "./TVSlider";

export const metadata: Metadata = {
  title: "Advantage Services",
  robots: { index: false, follow: false },
};

export default function TVPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0A0F1A]">
      <TVSlider />
    </main>
  );
}
