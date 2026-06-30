import Link from "next/link";
import { ArrowRight, Bot, Globe2, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

const pillars = [
  ["Confianza", "Vendedores VIP, procesos auditados y seguimiento claro de cada operacion.", ShieldCheck],
  ["Tecnologia", "Una plataforma digital para productos, servicios, pagos, remesas y ordenes.", Sparkles],
  ["Comunidad", "Conexion entre clientes, vendedores, provincias, municipios y oportunidades.", Handshake],
  ["Expansion", "Inicio en Cuba con vision de red comercial internacional.", Globe2]
] as const;

export default function QuienesSomosPage() {
  return (
    <AppShell>
      <section className="msm-hero-surface relative overflow-hidden text-white">
        <div className="msm-scanlines absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-16">
          <Badge className="border-white/20 bg-white/10 text-msm-ice">MSM MY STORE</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">Quienes somos</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-msm-ice">
            MSM MY STORE es una plataforma comercial y tecnologica creada para conectar personas,
            productos, servicios, remesas y oportunidades en un solo ecosistema digital.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-msm-blue px-5 text-sm font-bold text-white shadow-glow">
              Ver productos <ArrowRight size={17} />
            </Link>
            <Link href="/eliana" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur">
              YO SOY ELIANA <Bot size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft md:p-7">
          <Badge className="border-blue-200 bg-blue-50 text-msm-blue">Que hacemos</Badge>
          <h2 className="mt-4 text-3xl font-bold text-msm-ink">Comercio, remesas, pagos y entregas con orden.</h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
            <p>
              Trabajamos con una red de vendedores VIP, atencion personalizada, procesos organizados
              y asistencia inteligente para ofrecer confianza, rapidez, excelencia y seguridad en cada operacion.
            </p>
            <p>
              Facilitamos compras, remesas, cambios de divisas, pagos y entregas por provincia y municipio,
              comenzando por Cuba y proyectandonos hacia una red internacional.
            </p>
            <p>
              Nuestro marketplace permite encontrar productos y servicios con informacion clara:
              precio, ubicacion, vendedor responsable, disponibilidad, forma de entrega y seguimiento de la orden.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-msm-blue to-msm-navy p-5 text-white shadow-glow md:p-7">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-msm-blue">
            <Bot size={24} />
          </span>
          <h2 className="mt-4 text-3xl font-black">ELIANA IA</h2>
          <p className="mt-4 leading-8 text-msm-ice">
            ELIANA IA es la asistente inteligente de MSM MY STORE. Su funcion es orientar al cliente,
            responder preguntas, explicar procesos, apoyar pedidos, organizar informacion y mejorar la atencion
            dentro del ecosistema.
          </p>
          <p className="mt-4 leading-8 text-msm-ice">
            Con ELIANA IA, unimos tecnologia y servicio humano para brindar una experiencia mas rapida,
            clara y personalizada.
          </p>
          <Link href="/eliana" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-white px-4 text-sm font-bold text-msm-blue">
            Hablar con YO SOY ELIANA
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft md:p-7">
          <Badge className="border-blue-200 bg-blue-50 text-msm-blue">Nuestra vision</Badge>
          <h2 className="mt-4 max-w-4xl text-3xl font-bold text-msm-ink">
            Construir una plataforma moderna, confiable y escalable donde comercio, tecnologia, dinero,
            inteligencia artificial y comunidad trabajen juntos para crear soluciones reales.
          </h2>
          <p className="mt-4 text-lg font-bold text-msm-blue">
            MSM MY STORE: conectamos confianza, servicio y oportunidades.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(([title, detail, Icon]) => (
          <div key={title} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-msm-blue">
              <Icon size={21} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-msm-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
