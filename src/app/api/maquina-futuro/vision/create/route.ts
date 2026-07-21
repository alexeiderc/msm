import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateVision } from "@/lib/ai/maquina-futuro";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, idea, problem, finalScene, targetUsers, spiritualBase, visionType } = body;

    if (!title || !idea) {
      return NextResponse.json({ error: "title and idea are required" }, { status: 400 });
    }

    const aiResult = await generateVision({
      title,
      idea,
      problem,
      finalScene,
      spiritualBase,
      visionType
    });

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(aiResult);
    } catch {
      parsed = { raw: aiResult };
    }

    const { data: vision, error: insertError } = await supabase
      .from("project_visions")
      .insert({
        owner_id: user.id,
        title: (parsed.title as string) ?? title,
        subtitle: (parsed.subtitle as string) ?? "",
        vision_type: visionType ?? "INVENTION",
        status: "DRAFT",
        final_scene: (parsed.final_scene as string) ?? finalScene ?? "",
        divine_purpose: (parsed.purpose as string) ?? "",
        problem_statement: (parsed.problem as string) ?? problem ?? "",
        solution_statement: (parsed.solution as string) ?? "",
        target_users: (parsed.target_users as string) ?? targetUsers ?? "",
        vision_json: parsed,
        metadata: {
          technologies: parsed.technologies,
          modules: parsed.modules,
          team_required: parsed.team_required,
          risks: parsed.risks,
          next_steps: parsed.next_steps,
          declaration: parsed.declaration,
          spiritual_base: parsed.spiritual_base
        }
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase.from("audit_events").insert({
      actor_id: user.id,
      event_type: "VISION_CREATED",
      entity_type: "project_visions",
      entity_id: vision.id,
      metadata: { title }
    });

    return NextResponse.json({ vision });
  } catch (err) {
    console.error("Vision create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
