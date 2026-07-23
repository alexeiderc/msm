"use client";

import { MobileHeader } from "@/components/mobile/mobile-header";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";

export function MobileShell() {
  return (
    <div className="md:hidden">
      <MobileHeader />
      <MobileBottomNav />
    </div>
  );
}
