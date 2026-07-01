import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { SecurityForm } from "@/components/account/profile-forms";
import { logout } from "@/server/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountSecurityPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <Badge>Seguridad</Badge>
        <h1 className="mt-3 text-3xl font-black text-msm-ink">Proteccion de cuenta</h1>
        {!user ? (
          <Link href="/auth/login?next=/account/security" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
            Iniciar sesion
          </Link>
        ) : (
          <div className="mt-6 grid gap-5">
            <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
              <h2 className="flex items-center gap-2 font-bold"><ShieldCheck size={18} /> Cuenta</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">Correo: {user.email}</p>
              <p className="mt-1 text-sm text-slate-600">Email confirmado: {user.email_confirmed_at ? "si" : "pendiente"}</p>
            </div>
            <SecurityForm />
            <form action={logout} className="rounded-lg border border-red-100 bg-red-50 p-4">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white">
                <LogOut size={17} /> Cerrar sesion
              </button>
            </form>
          </div>
        )}
      </section>
    </AppShell>
  );
}
