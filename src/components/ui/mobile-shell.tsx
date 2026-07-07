"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";
import { ElianaFloatingButton } from "@/components/ai/eliana-floating-button";
import { ElianaAssistantPanel } from "@/components/ai/eliana-assistant-panel";

export function MobileShell() {
  const [isElianaOpen, setIsElianaOpen] = useState(false);

  return (
    <div className="md:hidden">
      <MobileHeader onElianaOpen={() => setIsElianaOpen(true)} />
      <MobileBottomNav />
      <ElianaFloatingButton onClick={() => setIsElianaOpen(true)} />
      <ElianaAssistantPanel
        isOpen={isElianaOpen}
        onClose={() => setIsElianaOpen(false)}
      />
    </div>
  );
}
