import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickPathsSection } from "@/components/home/QuickPathsSection";
import { PersonaCarousel } from "@/components/home/PersonaCarousel";
import { StatsSection } from "@/components/home/StatsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { TeamSection } from "@/components/home/TeamSection";
import { JourneyTimeline } from "@/components/home/JourneyTimeline";
import { FinalCTA } from "@/components/home/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { GOOGLE_RATING } from "@/lib/reviews";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title:
    "LLC, Tax, Licensing & ITIN Services in Queens NYC | Advantage Business Consulting",
  description:
    "Cambria Heights, NYC one-stop shop for LLC formation, tax prep, business licensing, ITIN, insurance, and audit defense. 4.9/5 on Google · 20+ years serving NYC small businesses · IRS Certified Acceptance Agent.",
  alternates: { canonical: makeCanonical("/") },
};

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      <JsonLd
        type="AggregateRating"
        ratingValue={GOOGLE_RATING.rating}
        reviewCount={GOOGLE_RATING.totalReviews}
      />
      <HeroSection />
      <QuickPathsSection />
      <StatsSection />
      <ReviewsSection />
      <PersonaCarousel />
      <TeamSection />
      <JourneyTimeline />
      <FinalCTA />
    </div>
  );
}
