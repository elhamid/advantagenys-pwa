import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { TropicalStarsDossier } from "./tropical-stars-dossier";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dossier-serif",
});

export const metadata: Metadata = {
  title: "Tropical Stars Growth Operating System",
  description:
    "Private Advantage Services growth dossier for Tropical Stars Talent Solutions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TropicalStarsPage() {
  return (
    <div className={fraunces.variable}>
      <TropicalStarsDossier />
    </div>
  );
}
