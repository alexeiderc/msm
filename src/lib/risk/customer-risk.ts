export type CustomerRiskLevel = "normal" | "revision" | "alto" | "bloqueado";

export type CustomerRiskInput = {
  kycStatus?: string | null;
  riskLevel?: string | null;
  paymentMethodValid?: boolean | null;
  hasChargebackAcceptance?: boolean;
  paymentOwnerMatches?: boolean;
  pendingOrders?: number;
  fraudAlerts?: number;
};

export type CustomerRiskResult = {
  score: number;
  level: CustomerRiskLevel;
  reasons: string[];
};

export function calculateCustomerRisk(input: CustomerRiskInput): CustomerRiskResult {
  let score = 0;
  const reasons: string[] = [];

  if (!input.hasChargebackAcceptance) {
    score += 35;
    reasons.push("Sin aceptacion antifraude/contracargo.");
  }

  if (input.kycStatus !== "aprobado") {
    score += input.kycStatus === "rechazado" ? 90 : 20;
    reasons.push(`KYC cliente en estado ${input.kycStatus ?? "pendiente"}.`);
  }

  if (!input.paymentMethodValid) {
    score += 15;
    reasons.push("Metodo de pago aun no validado por MSM.");
  }

  if (input.paymentOwnerMatches === false) {
    score += 25;
    reasons.push("Titular del pago no coincide exactamente con el cliente.");
  }

  if ((input.pendingOrders ?? 0) >= 3) {
    score += 20;
    reasons.push("Cliente con varias ordenes pendientes.");
  }

  if ((input.fraudAlerts ?? 0) > 0) {
    score += Math.min(35, (input.fraudAlerts ?? 0) * 12);
    reasons.push("Cliente con alertas antifraude anteriores.");
  }

  if (input.riskLevel === "bloqueado") {
    score = Math.max(score, 100);
    reasons.push("Cuenta marcada como bloqueada.");
  } else if (input.riskLevel === "alto") {
    score = Math.max(score, 75);
    reasons.push("Cuenta marcada como riesgo alto.");
  } else if (input.riskLevel === "revision") {
    score = Math.max(score, 45);
    reasons.push("Cuenta requiere revision administrativa.");
  }

  const level: CustomerRiskLevel =
    score >= 90 ? "bloqueado" : score >= 70 ? "alto" : score >= 35 ? "revision" : "normal";

  return {
    score,
    level,
    reasons: reasons.length ? reasons : ["Cliente sin senales criticas al crear la operacion."]
  };
}
