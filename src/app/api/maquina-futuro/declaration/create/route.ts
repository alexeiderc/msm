import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { visionId, text, category } = await req.json();
    if (!visionId || !text) {
      return NextResponse.json({ error: "visionId and text required" }, { status: 400 });
    }

    const { data: declaration, error } = await supabase
      .from("declarations")
      .insert({
        owner_id: user.id,
        vision_id: visionId,
        declaration_text: text,
        category: category ?? "YO_SOY"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ declaration });
  } catch (err) {
    console.error("Declaration create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
