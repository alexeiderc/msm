import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildElianaContext,
  elianaConfig,
  extractOpenAiText,
  getDemoElianaReply,
  getElianaSystemPrompt
} from "@/lib/ai/eliana";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000)
});

const requestSchema = z.object({
  mode: z.enum(["customer", "seller", "economic", "admin"]).default("customer"),
  messages: z.array(messageSchema).min(1).max(elianaConfig.maxMessages)
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Mensaje invalido para ELIANA. Revisa el texto enviado." },
      { status: 400 }
    );
  }

  const { messages, mode } = parsed.data;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUserMessage) {
    return NextResponse.json(
      { error: "ELIANA necesita una pregunta del usuario." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !elianaConfig.enabled) {
    return NextResponse.json({
      assistant: getDemoElianaReply(lastUserMessage.content, mode),
      mode: "demo",
      model: "local-demo"
    });
  }

  const instructions = `${getElianaSystemPrompt(mode)}\n\n${buildElianaContext()}`;
  const input = messages.map((message) => ({
    role: message.role,
    content: message.content
  }));

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: elianaConfig.model,
        instructions,
        input,
        max_output_tokens: 700
      })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "ELIANA no pudo conectarse con la IA ahora mismo.",
          detail: typeof payload === "object" && payload ? payload : undefined
        },
        { status: 502 }
      );
    }

    const assistant = extractOpenAiText(payload) || getDemoElianaReply(lastUserMessage.content, mode);

    return NextResponse.json({
      assistant,
      mode: "ai",
      model: elianaConfig.model
    });
  } catch {
    return NextResponse.json({
      assistant: getDemoElianaReply(lastUserMessage.content, mode),
      mode: "demo",
      model: "local-demo"
    });
  }
}
