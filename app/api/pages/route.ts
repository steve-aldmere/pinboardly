import { NextResponse } from "next/server";
iimport { getSupabaseClient } from "@/lib/supabase";
const supabase = getSupabaseClient();

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("/api/pages GET error:", error);
      return NextResponse.json(
        { error: "Failed to load pages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ pages: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error("/api/pages GET unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load pages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "page";

    const { data, error } = await supabase
      .from("pages")
      .insert({
        title,
        description: description ?? "",
        slug,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      console.error("/api/pages POST insert error:", error);
      return NextResponse.json(
        { error: "Failed to create page" },
        { status: 500 }
      );
    }

    return NextResponse.json({ page: data }, { status: 201 });
  } catch (err) {
    console.error("/api/pages POST unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
