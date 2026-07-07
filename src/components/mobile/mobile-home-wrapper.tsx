"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { TrendingBar } from "@/components/mobile/trending-bar";
import { MobileHero } from "@/components/mobile/mobile-hero";
import { MobileCategories } from "@/components/mobile/mobile-categories";
import { TrustBadges } from "@/components/mobile/trust-badges";
import { ProductCarousel } from "@/components/mobile/product-carousel";
import { VipJoinBanner } from "@/components/mobile/vip-join-banner";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";
import { ElianaFloatingButton } from "@/components/ai/eliana-floating-button";
import { ElianaAssistantPanel } from "@/components/ai/eliana-assistant-panel";

export function MobileHomeWrapper() {
  const [isElianaOpen, setIsElianaOpen] = useState(false);

  return (
    <>
      <MobileHeader onElianaOpen={() => setIsElianaOpen(true)} />
      <TrendingBar />
      <MobileHero />
      <MobileCategories />
      <TrustBadges />
      <ProductCarousel />
      <VipJoinBanner />
      <div className="h-28" />
      <ElianaFloatingButton onClick={() => setIsElianaOpen(true)} />
      <MobileBottomNav />
      <ElianaAssistantPanel
        isOpen={isElianaOpen}
        onClose={() => setIsElianaOpen(false)}
      />
    </>
  );
}
