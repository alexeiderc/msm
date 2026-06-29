"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import type { ElianaMessage } from "@/lib/ai/eliana";
import { ElianaActionLinks, ElianaMessageContent } from "@/components/ai/eliana-links";

const quickQuestions = [
  "Quiero crear cuenta",
  "Quiero comprar un producto",
  "Necesito subir un comprobante",
  "Quiero enviar una remesa"
];

export function ElianaFloatingAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [messages, setMessages] = useState<ElianaMessage[]>([
    {
      role: "assistant",
      content:
        "YO SOY ELIANA, asistente de MSM my store. Puedo ayudarte a crear cuenta en /auth/signup, completar KYC en /account/kyc, comprar, enviar remesas, subir comprobantes y proteger tus pagos dentro del sistema."
    }
  ]);

  const apiMessages = useMemo(
    () => messages.filter((message) => message.content.trim()).slice(-8),
    [messages]
  );

  useEffect(() => {
    if (pathname === "/eliana" || open) return;

    const showTimer = window.setInterval(() => {
      setShowIntro(true);
    }, 28000);

    return () => window.clearInterval(showTimer);
  }, [open, pathname]);

  useEffect(() => {
    if (!showIntro || open) return;

    const hideTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 8500);

    return () => window.clearTimeout(hideTimer);
  }, [open, showIntro]);

  if (pathname === "/eliana") return null;

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || status === "loading") return;

    const nextMessages: ElianaMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setOpen(true);
    setShowIntro(false);
    setStatus("loading");

    try {
      const response = await fetch("/api/eliana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "customer",
          messages: [...apiMessages, { role: "user", content }]
        })
      });

      const payload = (await response.json()) as {
        assistant?: string;
        error?: string;
      };

      if (!response.ok || !payload.assistant) {
        throw new Error(payload.error ?? "ELIANA no pudo responder.");
      }

      setMessages((current) => [...current, { role: "assistant", content: payload.assistant ?? "" }]);
      setStatus("idle");
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Ahora mismo no pude responder. Puedes intentar de nuevo o entrar a Soporte para continuar."
        }
      ]);
      setStatus("error");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-5">
      {open ? (
        <section className="w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-msm-line bg-white shadow-[0_24px_80px_rgba(10,31,68,0.26)]">
          <div className="flex items-center justify-between bg-msm-midnight px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-msm-blue shadow-glow">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="font-bold">YO SOY ELIANA</p>
                <p className="text-xs font-semibold text-msm-ice/75">Asistente de MSM my store</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-md text-white/75 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar ELIANA"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid max-h-80 min-h-72 gap-3 overflow-y-auto bg-gradient-to-b from-white to-blue-50/50 p-4">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";
              return (
                <div key={`${message.role}-${index}`} className={isAssistant ? "flex gap-2" : "flex justify-end"}>
                  {isAssistant ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-msm-blue text-white">
                      <Bot size={16} />
                    </span>
                  ) : null}
                  <div
                    className={
                      isAssistant
                        ? "max-w-[82%] rounded-lg border border-msm-line bg-white p-3 text-sm leading-6 text-slate-700 shadow-soft"
                        : "max-w-[82%] rounded-lg bg-msm-blue p-3 text-sm leading-6 text-white shadow-glow"
                    }
                  >
                    <ElianaMessageContent content={message.content} inverted={!isAssistant} />
                  </div>
                </div>
              );
            })}
            {status === "loading" ? (
              <p className="text-sm font-semibold text-slate-500">ELIANA esta respondiendo...</p>
            ) : null}
          </div>

          <div className="grid gap-2 border-t border-msm-line bg-white p-3">
            <ElianaActionLinks compact />
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-msm-blue transition hover:border-msm-blue"
                >
                  {question}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Preguntale a YO SOY ELIANA..."
                className="min-h-11 rounded-md border border-msm-silver px-3 text-sm outline-none focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={status === "loading" || !input.trim()}
                className="grid h-11 w-11 place-items-center rounded-md bg-msm-blue text-white shadow-glow transition hover:bg-msm-electric disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Enviar mensaje a ELIANA"
              >
                <Send size={17} />
              </button>
            </form>
            {status === "error" ? (
              <Link href="/support" className="text-xs font-bold text-red-600 hover:text-red-700">
                Ir a soporte si necesitas ayuda humana
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {!open && showIntro ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setShowIntro(false);
          }}
          className="eliana-intro-popover max-w-[286px] animate-[eliana-slide-in_360ms_ease-out] rounded-lg border border-blue-100 bg-white p-3 text-left text-sm leading-5 text-slate-700 shadow-lift transition hover:border-msm-blue"
        >
          <span className="block font-bold text-msm-ink">YO SOY ELIANA</span>
          <span className="text-slate-600">Toca aqui y te ayudo a crear cuenta, completar KYC, pagar seguro y seguir tu orden.</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setShowIntro(false);
        }}
        className="flex min-h-14 items-center gap-3 rounded-full bg-msm-blue px-4 text-sm font-bold text-white shadow-[0_18px_55px_rgba(25,123,210,0.36)] transition hover:bg-msm-electric"
        aria-label="Abrir asistente YO SOY ELIANA"
      >
        <MessageCircle size={22} />
        <span>YO SOY ELIANA</span>
      </button>
    </div>
  );
}
