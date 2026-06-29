"use client";

import { useEffect, useState } from "react";

declare global {
  interface Navigator {
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
    };
  }
}

const storageKey = "msm-low-data-mode";

function shouldAutoEnableLowData() {
  if (typeof navigator === "undefined") return false;

  const connection = navigator.connection;
  return Boolean(
    connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
  );
}

export function LowDataModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const nextEnabled = saved ? saved === "true" : shouldAutoEnableLowData();
    setEnabled(nextEnabled);
    setMounted(true);
    document.documentElement.dataset.lite = String(nextEnabled);
  }, []);

  function toggle() {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    window.localStorage.setItem(storageKey, String(nextEnabled));
    document.documentElement.dataset.lite = String(nextEnabled);
  }

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md border border-white/15 bg-white/10 px-2 py-2 text-xs font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
      aria-pressed={enabled}
    >
      {enabled ? "Modo ligero ON" : "Modo ligero"}
    </button>
  );
}
