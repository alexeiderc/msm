import Link from "next/link";
import { Construction, LogIn } from "lucide-react";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-msm-midnight px-4">
      <section className="mx-auto max-w-md rounded-lg border border-msm-line bg-white p-8 text-center shadow-lift">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100">
          <Construction size={28} className="text-amber-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-msm-ink">Registro cerrado</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          MSM my store se encuentra en fase de prueba y validacion. 
          Por el momento, solo los clientes que realicen un pago o sean 
          invitados directamente por un administrador pueden tener acceso.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Si deseas registrarte, contacta con el administrador o continua 
          con tu compra y recibiras tus credenciales tras el pago.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-msm-blue px-4 py-3 text-sm font-bold text-white"
          >
            <LogIn size={16} /> Ir a iniciar sesion
          </Link>
          <Link href="/" className="text-sm font-semibold text-msm-blue underline">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
