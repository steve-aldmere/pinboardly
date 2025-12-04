import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { title } = await req.json();

  if (!title || !title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("boards")
    .insert({ title })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }

  return NextResponse.json({ board: data }, { status: 201 });
}
