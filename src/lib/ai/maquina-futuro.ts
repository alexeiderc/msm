import { extractOpenAiText } from "./eliana";
import {
  MF_SYSTEM_BASE,
  MF_GENERATE_VISION,
  MF_GENERATE_MEDITATION,
  MF_GENERATE_INTERVIEW,
  MF_GENERATE_PROTOTYPE,
  MF_GENERATE_INVESTOR_PITCH,
  MF_GENERATE_BOOK_CHAPTER
} from "./maquina-futuro-prompts";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  return extractOpenAiText(data);
}

export type VisionInput = {
  title: string;
  idea: string;
  problem?: string;
  finalScene?: string;
  spiritualBase?: string;
  visionType?: string;
};

export async function generateVision(input: VisionInput): Promise<string> {
  const userMessage = [
    `Vision: ${input.title}`,
    `Idea: ${input.idea}`,
    input.problem ? `Problema: ${input.problem}` : "",
    input.finalScene ? `Escena final: ${input.finalScene}` : "",
    input.spiritualBase ? `Base espiritual: ${input.spiritualBase}` : "",
    input.visionType ? `Tipo: ${input.visionType}` : ""
  ].filter(Boolean).join("\n");

  return callOpenAI(MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_VISION, userMessage);
}

export async function generateMeditation(visionTitle: string, visionDetails: string): Promise<string> {
  return callOpenAI(
    MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_MEDITATION,
    `Vision: ${visionTitle}\nDetalles: ${visionDetails}`
  );
}

export async function generateInterview(visionTitle: string, visionDetails: string): Promise<string> {
  return callOpenAI(
    MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_INTERVIEW,
    `Vision: ${visionTitle}\nDetalles: ${visionDetails}`
  );
}

export async function generatePrototype(visionTitle: string, visionDetails: string): Promise<string> {
  return callOpenAI(
    MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_PROTOTYPE,
    `Vision: ${visionTitle}\nDetalles: ${visionDetails}`
  );
}

export async function generateInvestorPitch(visionTitle: string, visionDetails: string): Promise<string> {
  return callOpenAI(
    MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_INVESTOR_PITCH,
    `Vision: ${visionTitle}\nDetalles: ${visionDetails}`
  );
}

export async function generateBookChapter(
  chapterNumber: number,
  chapterTitle: string,
  bookContext: string
): Promise<string> {
  return callOpenAI(
    MF_SYSTEM_BASE + "\n\n" + MF_GENERATE_BOOK_CHAPTER,
    `Capitulo ${chapterNumber}: ${chapterTitle}\nContexto del libro: ${bookContext}`
  );
}
