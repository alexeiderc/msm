import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBookChapter } from "@/lib/ai/maquina-futuro";

const BOOK_OUTLINE = [
  { num: 1, title: "En el principio creo Dios" },
  { num: 2, title: "El final ya existia" },
  { num: 3, title: "Escribe la vision" },
  { num: 4, title: "Cosas grandes y ocultas" },
  { num: 5, title: "Si no entienden lo terrenal" },
  { num: 6, title: "El fuego de la humanidad" },
  { num: 7, title: "La piedra, la pintura y la primera memoria" },
  { num: 8, title: "La rueda, la tuerca y la llave" },
  { num: 9, title: "Los inventores que vieron antes" },
  { num: 10, title: "La boca como tecnologia espiritual" },
  { num: 11, title: "La meditacion como laboratorio invisible" },
  { num: 12, title: "La Maquina del Futuro" },
  { num: 13, title: "La nueva era de los inventos" },
  { num: 14, title: "El Modo Inventor" },
  { num: 15, title: "La entrevista final" },
  { num: 16, title: "La oracion del inventor" },
  { num: 17, title: "Aqui comienza todo" }
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterNumber } = await req.json();
    if (!chapterNumber || chapterNumber < 1 || chapterNumber > 17) {
      return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
    }

    const outline = BOOK_OUTLINE.find((c) => c.num === chapterNumber);
    if (!outline) return NextResponse.json({ error: "Chapter not found in outline" }, { status: 404 });

    let { data: bookProject } = await supabase
      .from("book_projects")
      .select("id")
      .eq("owner_id", user.id)
      .eq("title", "La Maquina del Futuro")
      .maybeSingle();

    if (!bookProject) {
      const { data: newBook } = await supabase
        .from("book_projects")
        .insert({
          owner_id: user.id,
          title: "La Maquina del Futuro",
          subtitle: "Vision, palabra, fe, inteligencia artificial y tecnologia para una nueva era de inventos revelados por Dios",
          status: "DRAFT"
        })
        .select()
        .single();
      bookProject = newBook;
    }

    const bookContext = "La Maquina del Futuro es un libro que conecta fe, creacion, tecnologia e invencion. Explora como Dios es el primer Creador, como la vision debe escribirse, como la IA puede ayudar a visualizar el futuro, y como los inventores pueden usar meditacion, palabra y codigo para construir el futuro.";

    const content = await generateBookChapter(chapterNumber, outline.title, bookContext);

    const { data: existingChapter } = await supabase
      .from("book_chapters")
      .select("id")
      .eq("book_id", bookProject!.id)
      .eq("chapter_number", chapterNumber)
      .maybeSingle();

    let chapter;
    if (existingChapter) {
      const { data } = await supabase
        .from("book_chapters")
        .update({ content, status: "DRAFT" })
        .eq("id", existingChapter.id)
        .select()
        .single();
      chapter = data;
    } else {
      const { data } = await supabase
        .from("book_chapters")
        .insert({
          book_id: bookProject!.id,
          chapter_number: chapterNumber,
          title: outline.title,
          content,
          status: "DRAFT"
        })
        .select()
        .single();
      chapter = data;
    }

    return NextResponse.json({ chapter });
  } catch (err) {
    console.error("Book generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
