import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rooms } = await supabase
      .from("investor_rooms")
      .select("id, room_name, summary, pitch_text, access_token, status, target_raise_amount, currency, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ rooms: rooms ?? [] });
  } catch (err) {
    console.error("Investor rooms list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
