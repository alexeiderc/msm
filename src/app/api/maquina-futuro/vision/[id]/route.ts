import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: vision } = await supabase
      .from("project_visions")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!vision) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: sessions } = await supabase
      .from("vision_sessions")
      .select("*")
      .eq("vision_id", id)
      .order("created_at", { ascending: false });

    const { data: declarations } = await supabase
      .from("declarations")
      .select("*")
      .eq("vision_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ vision, sessions: sessions ?? [], declarations: declarations ?? [] });
  } catch (err) {
    console.error("Vision GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
