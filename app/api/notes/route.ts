import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/notes  → list notes
export async function GET() {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ notes: data }, { status: 200 });
}

// POST /api/notes  → create a note
export async function POST(req: Request) {
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({ content })
    .select()
    .single();

  if (error) {
    console.error("Error inserting note:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }

  return NextResponse.json({ note: data }, { status: 201 });
}

// DELETE /api/notes  → delete by id (expects JSON body { id })
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
