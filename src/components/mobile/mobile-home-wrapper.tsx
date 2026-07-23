"use client";

import { MobileHeader } from "@/components/mobile/mobile-header";
import { TrendingBar } from "@/components/mobile/trending-bar";
import { MobileHero } from "@/components/mobile/mobile-hero";
import { MobileCategories } from "@/components/mobile/mobile-categories";
import { TrustBadges } from "@/components/mobile/trust-badges";
import { ProductCarousel } from "@/components/mobile/product-carousel";
import { VipJoinBanner } from "@/components/mobile/vip-join-banner";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";

export function MobileHomeWrapper() {
  return (
    <>
      <MobileHeader />
      <TrendingBar />
      <MobileHero />
      <MobileCategories />
      <TrustBadges />
      <ProductCarousel />
      <VipJoinBanner />
      <div className="h-28" />
      <MobileBottomNav />
    </>
  );
}
