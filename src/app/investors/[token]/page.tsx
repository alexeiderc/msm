import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Lock, TrendingUp, Target, Mail, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScriptureBanner } from "@/components/maquina-futuro/scripture-banner";

export const dynamic = "force-dynamic";

type InvestorRoomData = {
  room_name: string;
  summary?: string;
  pitch_text?: string;
  status: string;
  target_raise_amount?: number;
  currency?: string;
};

async function getPublicRoom(token: string): Promise<InvestorRoomData | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("investor_rooms")
      .select("room_name, summary, pitch_text, status, target_raise_amount, currency")
      .eq("access_token", token)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export default async function PublicInvestorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const room = await getPublicRoom(token);

  if (!room) notFound();

  return (
    <div className="min-h-screen bg-futura-void text-white">
      <header className="border-b border-white/10 bg-futura-deep">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="text-futura-ember" size={20} />
            <Badge className="bg-white/10 text-white border-white/20">Investor Room Privado</Badge>
          </div>
          <h1 className="text-3xl font-black">{room.room_name}</h1>
          {room.summary && <p className="mt-2 text-sm text-white/70">{room.summary}</p>}
          {room.target_raise_amount && (
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="text-futura-ember" size={16} />
              <span className="text-lg font-bold text-futura-ember">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: room.currency ?? "USD" }).format(room.target_raise_amount)}
              </span>
              <span className="text-xs text-white/50">meta de recaudacion</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {room.pitch_text && (
          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="text-futura-glow" size={18} /> Pitch del Proyecto
            </h2>
            <div className="text-sm leading-7 text-white/80 whitespace-pre-wrap">{room.pitch_text}</div>
          </section>
        )}

        <ScriptureBanner />

        <section className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Interesado en invertir?</h2>
          <p className="text-sm text-white/60 mb-4">Contacta al equipo de LA MAQUINA DEL FUTURO</p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:commercial@msmmystore.com" className="inline-flex items-center gap-2 rounded-md bg-futura-glow px-4 py-2 text-sm font-bold text-white">
              <Mail size={16} /> commercial@msmmystore.com
            </a>
            <span className="inline-flex items-center gap-2 text-sm text-white/50">
              <Building size={16} /> MSM MY STORE LLC
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
