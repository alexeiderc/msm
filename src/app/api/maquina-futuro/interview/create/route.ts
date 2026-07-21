import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInterview } from "@/lib/ai/maquina-futuro";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { visionId } = await req.json();
    if (!visionId) return NextResponse.json({ error: "visionId required" }, { status: 400 });

    const { data: vision } = await supabase
      .from("project_visions")
      .select("title, problem_statement, solution_statement, final_scene")
      .eq("id", visionId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!vision) return NextResponse.json({ error: "Vision not found" }, { status: 404 });

    const details = [
      vision.problem_statement && `Problema: ${vision.problem_statement}`,
      vision.solution_statement && `Solucion: ${vision.solution_statement}`,
      vision.final_scene && `Escena final: ${vision.final_scene}`
    ].filter(Boolean).join("\n");

    const output = await generateInterview(vision.title, details);

    const { data: session, error } = await supabase
      .from("vision_sessions")
      .insert({
        vision_id: visionId,
        owner_id: user.id,
        session_type: "INTERVIEW",
        input_text: vision.title,
        output_text: output,
        ai_model: process.env.OPENAI_MODEL ?? "gpt-5.5",
        symbolic_seal: "369"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Interview create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
