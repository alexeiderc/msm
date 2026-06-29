import { TrustPage } from "@/components/public/trust-page";

export default function GuaranteesPage() {
  return (
    <TrustPage
      title="Garantias y entregas"
      intro="MSM exige evidencia y seguimiento, pero el producto, garantia, calidad y entrega son responsabilidad del vendedor independiente."
      items={[
        "Cada producto puede tener SLA prometido: 24h, 48h, 72h o bajo gestion.",
        "El vendedor VIP debe responder dentro de su ventana de confirmacion o la orden puede reasignarse.",
        "Las demoras por clima, transporte, electricidad o disposiciones oficiales se tratan como fuerza mayor.",
        "Las reclamaciones se documentan por escrito y se atienden dentro del flujo de soporte."
      ]}
    />
  );
}
