import { TrustPage } from "@/components/public/trust-page";

export default function HowItWorksPage() {
  return (
    <TrustPage
      title="Como funciona"
      intro="MSM organiza la compra, el pago, la orden y la trazabilidad. El vendedor VIP independiente entrega localmente en Cuba."
      items={[
        "El comprador elige productos por provincia, municipio, categoria y tienda verificada.",
        "MSM crea una orden con numero unico, pago pendiente y cuenta manual asignada solo dentro de la orden.",
        "Economia revisa comprobante; al aprobarlo, la orden pasa a pago_confirmado y se activa la entrega VIP.",
        "El VIP confirma disponibilidad, prepara, entrega y sube evidencia auditable."
      ]}
    />
  );
}
