import { NextResponse } from "next/server";
import { supabase } from "@/lib/suimport { getSupabaseClient } from "@/lib/supabase";

const supabase = getSupabaseClient();pabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const page_id: string = body.page_id;
    const type: string = body.type ?? "text";
    const content = body.content;
    const order: number = body.order ?? 0;

    // Basic validation
    if (!page_id || !content) {
      return NextResponse.json(
        { error: "page_id and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("blocks")
      .insert({
        page_id,
        type,
        content,
        sort_order: order
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create block" },
        { status: 500 }
      );
    }

    return NextResponse.json({ block: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/blocks unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
