import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: bookProject } = await supabase
      .from("book_projects")
      .select("id")
      .eq("owner_id", user.id)
      .eq("title", "La Maquina del Futuro")
      .maybeSingle();

    if (!bookProject) return NextResponse.json({ chapters: [] });

    const { data: chapters } = await supabase
      .from("book_chapters")
      .select("id, chapter_number, title, content, status")
      .eq("book_id", bookProject.id)
      .order("chapter_number", { ascending: true });

    return NextResponse.json({ chapters: chapters ?? [] });
  } catch (err) {
    console.error("Book list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
