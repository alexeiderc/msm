import { AppShell } from "@/components/ui/shell";
import { ElianaChat } from "@/components/ai/eliana-chat";
import { ElianaCommandCenter } from "@/components/ai/eliana-command-center";

export default function ElianaPage() {
  return (
    <AppShell>
      <section className="msm-hero-surface relative isolate overflow-hidden px-4 py-8 md:py-12">
        <div className="absolute inset-0 bg-msm-midnight/35" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-5">
          <ElianaCommandCenter compact />
          <ElianaChat />
        </div>
      </section>
    </AppShell>
  );
}
