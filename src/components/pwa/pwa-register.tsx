"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    const enabled =
      process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_PWA_ENABLED === "true";

    if (!enabled || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}
