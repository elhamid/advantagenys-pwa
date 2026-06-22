import type { Metadata } from "next";
import { PergolaDossier } from "./pergola-dossier";

export const metadata: Metadata = {
  title: "12×16 Louvered Pergola — Motorized vs Manual vs Budget",
  description:
    "Private louvered-pergola shortlist: single clear 16-ft span, motorized vs manual vs budget center-beam options.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PergolaPage() {
  return <PergolaDossier />;
}
