import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomName, summary, targetRaiseAmount, visionId } = await req.json();

    const { data: room, error } = await supabase
      .from("investor_rooms")
      .insert({
        owner_id: user.id,
        vision_id: visionId ?? null,
        room_name: roomName ?? "Investor Room",
        summary: summary ?? "",
        target_raise_amount: targetRaiseAmount ?? null,
        status: "PRIVATE"
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_events").insert({
      actor_id: user.id,
      event_type: "INVESTOR_ROOM_CREATED",
      entity_type: "investor_rooms",
      entity_id: room.id,
      metadata: { room_name: roomName }
    });

    return NextResponse.json({ room });
  } catch (err) {
    console.error("Investor room create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
