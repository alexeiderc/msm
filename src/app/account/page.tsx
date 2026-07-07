import Link from "next/link";
import { Camera, Heart, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload, ProfileForm } from "@/components/account/profile-forms";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  try {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return { user, profile: data };
  } catch {
    return { user, profile: null };
  }
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const { user, profile } = await getProfile();
  const isPaused = params.status === "pausado" || profile?.status === "pausado";

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <Badge>Mi cuenta MSM</Badge>
        <h1 className="mt-3 text-3xl font-black text-msm-ink">Perfil, seguridad y confianza</h1>
        {isPaused ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Tu cuenta esta pausada. Puedes revisar perfil y seguridad, pero los paneles operativos permanecen suspendidos hasta que administracion reactive tu acceso.
          </div>
        ) : null}
        {!user ? (
          <div className="mt-6 rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <p className="font-semibold text-slate-600">Inicia sesion para administrar tu cuenta.</p>
            <Link href="/auth/login?next=/account" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-msm-blue px-4 text-sm font-bold text-white">
              Entrar
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/account/profile" className="rounded-lg border border-msm-line bg-white p-4 shadow-soft hover:border-msm-blue">
                <UserRound className="text-msm-blue" size={22} />
                <p className="mt-2 font-bold">Perfil</p>
              </Link>
              <Link href="/wishlist" className="rounded-lg border border-msm-line bg-white p-4 shadow-soft hover:border-msm-blue">
                <Heart className="text-msm-blue" size={22} />
                <p className="mt-2 font-bold">Favoritos</p>
              </Link>
              <Link href="/account/kyc" className="rounded-lg border border-msm-line bg-white p-4 shadow-soft hover:border-msm-blue">
                <Camera className="text-msm-blue" size={22} />
                <p className="mt-2 font-bold">KYC</p>
              </Link>
            </div>
            <AvatarUpload profile={profile} />
            <ProfileForm profile={profile} />
          </div>
        )}
      </section>
    </AppShell>
  );
}
