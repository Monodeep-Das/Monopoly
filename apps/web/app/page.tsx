import { HeroSection } from "@/components/landing/HeroSection";
import { TradeSection } from "@/components/landing/TradeSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { GameplayPreviewSection } from "@/components/landing/GameplayPreviewSection";
import { HowToPlaySection } from "@/components/landing/HowToPlaySection";
import { Footer } from "@/components/landing/Footer";
import { CustomCursor } from "@/components/landing/CustomCursor";
import { Preloader } from "@/components/landing/Preloader";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-primary/30 md:cursor-none">
      <Preloader />
      <CustomCursor />
      <HeroSection />
      <TradeSection />
      <FeaturesSection />
      <GameplayPreviewSection />
      <HowToPlaySection />
      <Footer />
    </div>
  );
}
