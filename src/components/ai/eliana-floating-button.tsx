"use client";

import { ElianaDiamond } from "@/components/ai/eliana-diamond";

export function ElianaFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-0.5 md:hidden"
      style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Abrir ELIANA IA"
    >
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-msm-blue to-violet-600 shadow-lg shadow-blue-500/30 ring-2 ring-white/60 transition active:scale-90 dark:ring-slate-800/60">
        <ElianaDiamond size={34} className="drop-shadow-lg" />
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-800" />
      </span>
      <span className="text-[10px] font-extrabold text-msm-blue dark:text-blue-400">ELIANA</span>
    </button>
  );
}
