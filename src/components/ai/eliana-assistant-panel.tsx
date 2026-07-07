"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, PlusCircle, Package, Truck, MessageCircle, Send, ShoppingBag, Loader2 } from "lucide-react";
import { ElianaDiamond } from "@/components/ai/eliana-diamond";

const quickActions = [
  ["Buscar productos", Search, "/products"],
  ["Crear orden", PlusCircle, "/checkout"],
  ["Mis órdenes", Package, "/orders"],
  ["Envíos a Cuba", Truck, "/remittances"],
  ["Hablar con MSM", MessageCircle, "/support"],
] as const;

type ChatMessage = { role: "user" | "bot"; text: string };

export function ElianaAssistantPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  async function sendMessage() {
    const text = message.trim();
    if (!text || loading) return;
    setMessage("");
    setChat((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/eliana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setChat((prev) => [...prev, { role: "bot", text: "Lo siento, ocurrió un error. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
  }

  function handleQuickAction(_label: string, _Icon: typeof Search, href: string) {
    onClose();
    window.location.href = href;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[85vh] w-full flex-col rounded-t-3xl bg-white pb-2 shadow-2xl dark:bg-slate-900 md:mx-auto md:h-[600px] md:max-w-md md:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-msm-blue to-violet-600 shadow-md">
              <ElianaDiamond size={24} />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">ELIANA</h2>
              <p className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                En línea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {chat.length === 0 ? (
            <>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue-50 via-violet-50 to-blue-100 shadow-inner dark:from-blue-900/30 dark:via-violet-900/30 dark:to-blue-900/30">
                  <ElianaDiamond size={52} />
                </span>
                <div>
                  <p className="text-base font-extrabold text-slate-800 dark:text-white">
                    Hola 👋 Soy ELIANA
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Tu asistente virtual de MSM MY STORE.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-500">
                    Puedo ayudarte a buscar productos, crear órdenes, consultar envíos y orientarte dentro de MSM Marketplace.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Opciones rápidas
                </p>
                {quickActions.map(([label, Icon, href]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleQuickAction(label, Icon, href)}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 text-msm-blue dark:from-blue-900/30 dark:to-violet-900/30">
                      <Icon size={18} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <div className="flex items-start gap-3">
                  <ShoppingBag size={18} className="mt-0.5 shrink-0 text-msm-blue" />
                  <div>
                    <p className="text-xs font-extrabold text-msm-blue dark:text-blue-400">¿Listo para comprar?</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Todo lo que deseas, aquí lo encuentras. Compra fácil. Recibe seguro en Cuba.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {chat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed ${
                      msg.role === "user"
                        ? "bg-msm-blue text-white"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                    <Loader2 size={14} className="animate-spin text-slate-500" />
                    <span className="text-sm font-semibold text-slate-500">Escribiendo...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-msm-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-msm-blue to-violet-600 text-white shadow-md transition active:scale-90 disabled:opacity-50"
              aria-label="Enviar"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
