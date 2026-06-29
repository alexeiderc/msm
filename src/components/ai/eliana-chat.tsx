"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import type { ElianaMessage, ElianaMode } from "@/lib/ai/eliana";
import { ElianaActionLinks, ElianaMessageContent } from "@/components/ai/eliana-links";

const starters = [
  "Quiero crear una cuenta",
  "Quiero comprar un producto para Segundo Frente",
  "Como subo el comprobante de pago?",
  "Quiero enviar una remesa",
  "Tengo una reclamacion por una orden",
  "Soy vendedor VIP y quiero publicar productos"
];

export function ElianaChat() {
  const [mode, setMode] = useState<ElianaMode>("customer");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [runtime, setRuntime] = useState<"demo" | "ai" | null>(null);
  const [messages, setMessages] = useState<ElianaMessage[]>([
    {
      role: "assistant",
      content:
        "YO SOY ELIANA. Estoy aqui para ayudarte a crear cuenta, completar KYC, comprar, enviar remesas, subir comprobantes, seguir ordenes, revisar vendedores VIP y abrir soporte. Puedo abrir enlaces como /auth/signup, /account/kyc, /products, /remittances, /orders y /support."
    }
  ]);

  const apiMessages = useMemo(
    () => messages.filter((message) => message.content.trim()).slice(-9),
    [messages]
  );

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || status === "loading") return;

    const nextMessages: ElianaMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setStatus("loading");

    try {
      const response = await fetch("/api/eliana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: [...apiMessages, { role: "user", content }]
        })
      });

      const payload = (await response.json()) as {
        assistant?: string;
        mode?: "demo" | "ai";
        error?: string;
      };

      if (!response.ok || !payload.assistant) {
        throw new Error(payload.error ?? "ELIANA no pudo responder.");
      }

      setRuntime(payload.mode ?? "demo");
      setMessages((current) => [...current, { role: "assistant", content: payload.assistant ?? "" }]);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Ahora mismo no pude responder con la IA. Puedes intentar otra vez o entrar a Ayuda y Soporte para continuar."
        }
      ]);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="rounded-lg border border-white/15 bg-white/10 p-5 text-white shadow-glow backdrop-blur">
        <Badge className="border-white/20 bg-white/10 text-msm-ice">Asistente IA</Badge>
        <h1 className="mt-4 text-4xl font-bold">YO SOY ELIANA</h1>
        <p className="mt-3 leading-7 text-msm-ice/85">
          La asistente inteligente de MSM my store para guiar compras, pagos, remesas, ordenes,
          vendedores VIP, soporte y operaciones internas.
        </p>
        <div className="mt-5 grid gap-3">
          <label className="text-sm font-bold text-msm-ice">Modo de ayuda</label>
          <Select
            value={mode}
            onChange={(event) => setMode(event.target.value as ElianaMode)}
            className="border-white/20 bg-white text-msm-ink"
          >
            <option value="customer">Cliente</option>
            <option value="seller">Vendedor VIP</option>
            <option value="economic">Area economica</option>
            <option value="admin">Administrador</option>
          </Select>
        </div>
        <div className="mt-5 rounded-lg border border-white/15 bg-white/10 p-4 text-sm leading-6 text-msm-ice/80">
          Estado: {runtime === "ai" ? "IA real conectada" : runtime === "demo" ? "Modo demo local" : "Lista para responder"}
        </div>
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-msm-ice">Abrir enlaces</p>
          <ElianaActionLinks />
        </div>
        <div className="mt-5 grid gap-2">
          {starters.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => void sendMessage(starter)}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {starter}
            </button>
          ))}
        </div>
      </aside>

      <section className="overflow-hidden rounded-lg border border-msm-line bg-white shadow-lift">
        <div className="border-b border-msm-line bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-msm-blue text-white shadow-glow">
              <Sparkles size={19} />
            </span>
            <div>
              <h2 className="font-bold text-msm-ink">Chat con YO SOY ELIANA</h2>
              <p className="text-xs font-semibold text-slate-500">Orientacion operativa, no reemplaza revision humana MSM.</p>
            </div>
          </div>
        </div>
        <div className="grid max-h-[560px] min-h-[420px] gap-3 overflow-y-auto bg-gradient-to-b from-white to-blue-50/40 p-4">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            return (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
                {isAssistant ? (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-msm-blue text-white">
                    <Bot size={18} />
                  </span>
                ) : null}
                <div
                  className={
                    isAssistant
                      ? "max-w-[85%] rounded-lg border border-msm-line bg-white p-3 text-sm leading-6 text-slate-700 shadow-soft"
                      : "max-w-[85%] rounded-lg bg-msm-blue p-3 text-sm leading-6 text-white shadow-glow"
                  }
                >
                  <ElianaMessageContent content={message.content} inverted={!isAssistant} />
                </div>
                {!isAssistant ? (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-msm-midnight text-white">
                    <UserRound size={18} />
                  </span>
                ) : null}
              </div>
            );
          })}
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-msm-blue" />
              ELIANA esta pensando...
            </div>
          ) : null}
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 border-t border-msm-line bg-white p-4 md:grid-cols-[1fr_auto]">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu pregunta para YO SOY ELIANA..."
            className="min-h-16"
          />
          <Button type="submit" disabled={status === "loading" || !input.trim()} className="md:self-end">
            <Send size={17} />
            Enviar
          </Button>
          {status === "error" ? (
            <p className="text-sm font-semibold text-red-600 md:col-span-2">
              Hubo un problema temporal con ELIANA. Intenta otra vez.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
