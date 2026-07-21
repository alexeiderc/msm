import { AppShell } from "@/components/ui/shell";
import { ElianaChat } from "@/components/ai/eliana-chat";
import { ElianaCommandCenter } from "@/components/ai/eliana-command-center";
import { ExternalLink, Sparkles } from "lucide-react";
import { elianaIncubatorUrl } from "@/lib/eliana-incubator";

export default function ElianaPage() {
  return (
    <AppShell>
      <section className="msm-hero-surface relative isolate overflow-hidden px-4 py-8 md:py-12">
        <div className="absolute inset-0 bg-msm-midnight/35" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-5">
          <ElianaCommandCenter compact />
          <section className="flex flex-col gap-4 rounded-lg border border-cyan-200/30 bg-msm-midnight/55 p-5 text-white shadow-glow backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">
                <Sparkles size={16} /> La Incubadora del Futuro
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-msm-ice/85">
                Esta ELIANA orienta las operaciones de MSM. La Incubadora ayuda a convertir tus ideas, procesos y proyectos en sistemas digitales.
              </p>
            </div>
            <a
              href={elianaIncubatorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-3 text-sm font-black text-msm-midnight transition hover:bg-white"
            >
              Abrir Incubadora <ExternalLink size={16} />
            </a>
          </section>
          <ElianaChat />
        </div>
      </section>
    </AppShell>
  );
}
