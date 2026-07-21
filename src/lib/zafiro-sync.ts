export const zafiroModule = {
  name: "ZAFIRO",
  tagline: "Red social del conocimiento impulsada por IA",
  owner: "MSM",
  localPath: "C:\\Users\\cm8ms\\Documents\\Codex\\2026-07-17\\https-zafiro-msmmystore-com",
  localUrl: "http://localhost:3001",
  productionUrl: process.env.NEXT_PUBLIC_ZAFIRO_URL || "https://zafiro.msmmystore.com",
  sponsorUrl: "https://zafiro.msmmystore.com/sponsors-page",
  status: "sincronizado_como_modulo",
  summary:
    "ZAFIRO funciona como modulo de conocimiento, reputacion, comunidad y aprendizaje dentro del ecosistema MSM. MSM MY STORE mantiene comercio, pagos, remesas, ordenes y entregas.",
  elianaRole:
    "ELIANA conecta MSM MY STORE con ZAFIRO: orienta compras y pagos en MSM, y puede llevar al usuario hacia conocimiento, comunidad, reputacion y aprendizaje en ZAFIRO.",
  pillars: [
    "Conocimiento organizado por IA",
    "Preguntas y respuestas de alto valor",
    "Reputacion PTS y Life Score futuro",
    "Comunidad MSM y Cuba Plus",
    "Perfiles del ecosistema MSM",
    "ELIANA como nucleo inteligente"
  ],
  marketplaceConnections: [
    "Un comprador puede comprar en MSM MY STORE y compartir experiencia o reputacion en ZAFIRO.",
    "Un vendedor VIP puede ganar reputacion por cumplimiento, calidad y atencion.",
    "Saldo MSM y Life Score pueden alimentar senales futuras de confianza.",
    "ELIANA puede dirigir desde MSM hacia ZAFIRO cuando el usuario busca aprender, comunidad o perfil del ecosistema."
  ],
  routes: [
    { label: "Abrir ZAFIRO local", href: "http://localhost:3001" },
    { label: "ZAFIRO produccion", href: "https://zafiro.msmmystore.com" },
    { label: "Sponsors ZAFIRO", href: "https://zafiro.msmmystore.com/sponsors-page" },
    { label: "ELIANA MSM", href: "/eliana" },
    { label: "Perfil MSM", href: "/quienes-somos" }
  ]
} as const;
