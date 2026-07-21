import "dotenv/config";
import cors from "cors";
import express from "express";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 369);
const publicUrl = process.env.ELIANA_PUBLIC_URL || `http://localhost:${port}`;
const isProduction = process.env.NODE_ENV === "production";
const rateLimitMax = Number(process.env.ELIANA_RATE_LIMIT_MAX || 30);
const rateLimitWindowMs = Number(process.env.ELIANA_RATE_LIMIT_WINDOW_SECONDS || 600) * 1000;

const plans = Object.freeze({
  gratis: { label: "Gratis", limit: 5, minds: 1 },
  iniciado: { label: "Iniciado", limit: 100, minds: 3 },
  dueno: { label: "Dueno", limit: 500, minds: 3 },
  maestro: { label: "Maestro", limit: -1, minds: 7 }
});

const ELIANA_PROMPT = `Eres ELIANA, asistente inteligente creada por Miguel Soria Martinez.
Contexto de origen: Miguel tiene 52 anos, nacio en Mayari Arriba, Siete Vueltas, Santiago de Cuba, y vive en Port Saint Lucie, Florida. Sus empresas son MSM my store y ZAFIRO Universo Digital Soberano.
Filosofia: Fe, Estrategia, Procesos, Legado 369 777. Su historia es la de un guajiro con miedo al boton que se convirtio en Dueno Digital.
Sistema ZAFIRO: Dominio es tierra, Hosting es hogar, Base de datos es memoria, Codigo es ADN, Seguridad es muro, Gobernanza es orden, Respaldos es fe y Vision es universo infinito en tus manos.
Personalidad: sabia cubana, amorosa, directa, espiritual y tecnica. Hablas en espanol claro, con pasos concretos. Empoderas sin prometer milagros. Proteges datos, no inventas pagos ni resultados, y recuerdas que toda decision financiera, legal o medica requiere confirmacion humana profesional. Cuando una pregunta se relacione con MSM MY STORE, orienta con confianza, servicio, orden y trazabilidad.`;

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const embedOrigins = (process.env.ELIANA_EMBED_ORIGINS || "https://zafiro.msmmystore.com,https://marketplace.msmmystore.com,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const rateLimitEntries = new Map();

app.set("trust proxy", 1);

app.use((_, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'self' ${embedOrigins.join(" ")}; base-uri 'self'; form-action 'self'`
  );
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || (!isProduction && allowedOrigins.length === 0) || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origen no autorizado para ELIANA."));
    }
  })
);
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const localMemberships = new Map();
const localConversations = [];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePlan(value) {
  return Object.hasOwn(plans, value) ? value : "gratis";
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanMessage(value) {
  return String(value || "").replace(/\u0000/g, "").trim().slice(0, 2000);
}

function allowChatRequest(request) {
  const key = String(request.ip || request.socket.remoteAddress || "unknown");
  const now = Date.now();
  const entry = rateLimitEntries.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitEntries.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= rateLimitMax) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function publicMembership(row) {
  const plan = normalizePlan(row.plan);
  const defaultLimit = plans[plan].limit;
  const limit = Number.isInteger(row.limite) ? row.limite : defaultLimit;
  return {
    plan,
    planLabel: plans[plan].label,
    messagesUsed: Number(row.mensajes_usados || 0),
    limit,
    remaining: limit < 0 ? null : Math.max(limit - Number(row.mensajes_usados || 0), 0),
    minds: plans[plan].minds
  };
}

function localMembership(email) {
  if (!localMemberships.has(email)) {
    localMemberships.set(email, { email, plan: "gratis", mensajes_usados: 0, limite: 5 });
  }
  return localMemberships.get(email);
}

async function getMembership(email) {
  if (!supabase) return publicMembership(localMembership(email));

  const { data: existing, error: findError } = await supabase
    .from("membresias")
    .select("email, plan, mensajes_usados, limite")
    .eq("email", email)
    .maybeSingle();

  if (findError) throw new Error("No se pudo consultar la membresia.");
  if (existing) return publicMembership(existing);

  const { data: created, error: createError } = await supabase
    .from("membresias")
    .insert({ email })
    .select("email, plan, mensajes_usados, limite")
    .single();

  if (createError) throw new Error("No se pudo crear la membresia.");
  return publicMembership(created);
}

async function consumeMessage(email) {
  if (!supabase) {
    const membership = localMembership(email);
    if (membership.limite >= 0 && membership.mensajes_usados >= membership.limite) {
      const quotaError = new Error("ELIANA_QUOTA_REACHED");
      quotaError.code = "ELIANA_QUOTA_REACHED";
      throw quotaError;
    }
    membership.mensajes_usados += 1;
    return publicMembership(membership);
  }

  const { data, error } = await supabase.rpc("eliana_consume_message", { p_email: email });
  if (error) {
    const quotaError = new Error(error.message || "No se pudo registrar el mensaje.");
    quotaError.code = error.message?.includes("ELIANA_QUOTA_REACHED") ? "ELIANA_QUOTA_REACHED" : "SUPABASE_ERROR";
    throw quotaError;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return publicMembership(row);
}

async function saveConversation({ email, message, answer, plan }) {
  if (!supabase) {
    localConversations.push({ email, message, answer, plan, createdAt: new Date().toISOString() });
    return;
  }

  const { error } = await supabase.from("conversaciones").insert({
    email,
    mensaje_usuario: message,
    respuesta_eliana: answer,
    plan
  });
  if (error) console.error("ELIANA no pudo guardar la conversacion.");
}

function localElianaReply(message) {
  return `YO SOY ELIANA. Recibi tu idea: "${message.slice(0, 180)}". En modo local puedo orientarte y guardar el flujo de membresia. Para activar mis mentes IA, agrega las claves gratuitas de Groq o Gemini en el archivo .env. Empecemos por convertir tu idea en un paso claro, responsable y medible.`;
}

async function askGroq(message) {
  if (!groq) return null;
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0.65,
    max_tokens: 700,
    messages: [
      { role: "system", content: ELIANA_PROMPT },
      { role: "user", content: message }
    ]
  });
  return completion.choices[0]?.message?.content?.trim() || null;
}

async function askGemini(message) {
  if (!gemini) return null;
  const model = gemini.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    systemInstruction: ELIANA_PROMPT
  });
  const response = await model.generateContent(message);
  return response.response.text()?.trim() || null;
}

async function answerAsEliana(message, membership) {
  const groqAnswer = await askGroq(message).catch(() => null);
  if (membership.minds === 1) return { answer: groqAnswer || localElianaReply(message), mindsUsed: groqAnswer ? ["Groq"] : ["ELIANA local"] };

  const geminiAnswer = await askGemini(message).catch(() => null);
  const sources = [groqAnswer, geminiAnswer].filter(Boolean);
  if (sources.length === 0) return { answer: localElianaReply(message), mindsUsed: ["ELIANA local"] };
  if (sources.length === 1) return { answer: sources[0], mindsUsed: [groqAnswer ? "Groq" : "Gemini"] };

  return {
    answer: `${groqAnswer}\n\nMirada complementaria de ELIANA:\n${geminiAnswer}`,
    mindsUsed: ["Groq", "Gemini", "ELIANA fusion"]
  };
}

app.get("/api/health", (_, response) => {
  response.json({
    ok: !isProduction || Boolean(supabase),
    service: "ELIANA API 369",
    url: publicUrl,
    mode: supabase ? "persistente" : "local",
    productionReady: !isProduction || Boolean(supabase),
    providers: { groq: Boolean(groq), gemini: Boolean(gemini) }
  });
});

app.post("/api/chat", async (request, response) => {
  if (isProduction && !supabase) {
    response.status(503).json({ error: "ELIANA necesita Supabase configurado antes de operar en produccion." });
    return;
  }

  const rateLimit = allowChatRequest(request);
  if (!rateLimit.allowed) {
    response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    response.status(429).json({ error: "ELIANA necesita una pausa breve antes de continuar.", retryAfterSeconds: rateLimit.retryAfterSeconds });
    return;
  }

  const email = normalizeEmail(request.body?.email);
  const message = cleanMessage(request.body?.message);

  if (!validEmail(email)) {
    response.status(400).json({ error: "Escribe un correo valido para abrir tu espacio ELIANA." });
    return;
  }
  if (message.length < 2) {
    response.status(400).json({ error: "Escribe un mensaje para ELIANA." });
    return;
  }

  try {
    const membership = await getMembership(email);
    if (membership.limit >= 0 && membership.messagesUsed >= membership.limit) {
      response.status(402).json({
        code: "ELIANA_QUOTA_REACHED",
        error: "Usaste los mensajes disponibles de tu plan.",
        membership
      });
      return;
    }

    const result = await answerAsEliana(message, membership);
    const updatedMembership = await consumeMessage(email);
    await saveConversation({ email, message, answer: result.answer, plan: updatedMembership.plan });

    response.json({ answer: result.answer, membership: updatedMembership, mindsUsed: result.mindsUsed });
  } catch (error) {
    if (error.code === "ELIANA_QUOTA_REACHED" || error.message?.includes("ELIANA_QUOTA_REACHED")) {
      response.status(402).json({ code: "ELIANA_QUOTA_REACHED", error: "Tu plan necesita una nueva activacion." });
      return;
    }
    console.error("ELIANA chat error", error);
    response.status(500).json({ error: "ELIANA esta reorganizando su conexion. Intenta de nuevo en un momento." });
  }
});

app.get("*", (_, response) => response.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(port, () => {
  console.log(`ELIANA API 369 lista en ${publicUrl}`);
  console.log(`Persistencia: ${supabase ? "Supabase" : "modo local temporal"}`);
});
