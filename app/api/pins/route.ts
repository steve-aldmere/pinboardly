// app/api/pins/route.ts

import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return NextResponse.json(
      { error: "Missing boardId" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("pins")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { boardId, content, url, event_date } = body;

  if (!boardId || !content) {
    return NextResponse.json(
      { error: "boardId and content are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  const insertData: any = {
    board_id: boardId,
    content,
  };

  if (url) {
    insertData.url = url;
  }
  if (event_date) {
    insertData.event_date = event_date; // ISO / YYYY-MM-DD
  }

  const { data, error } = await supabase
    .from("pins")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("pins")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
