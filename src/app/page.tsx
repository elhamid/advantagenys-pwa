import { HeroSection } from "@/components/home/HeroSection";
import { QuickPathsSection } from "@/components/home/QuickPathsSection";
import { PersonaCarousel } from "@/components/home/PersonaCarousel";
import { StatsSection } from "@/components/home/StatsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { TeamSection } from "@/components/home/TeamSection";
import { JourneyTimeline } from "@/components/home/JourneyTimeline";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
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
