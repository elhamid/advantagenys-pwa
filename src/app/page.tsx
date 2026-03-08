import { HeroSection } from "@/components/home/HeroSection";
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
      <PersonaCarousel />
      <StatsSection />
      <ReviewsSection />
      <TeamSection />
      <JourneyTimeline />
      <FinalCTA />
    </div>
  );
}
