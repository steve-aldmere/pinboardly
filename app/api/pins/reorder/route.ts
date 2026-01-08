import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/respond";

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

type PinRow = {
  id: string;
  board_id: string;
  position: number | null;
  created_at: string;
};

async function normalizePositions(supabase: any, boardId: string) {
  // Order: existing positions first, then newest first for nulls
  const { data, error } = await supabase
    .from("pins")
    .select("id, board_id, position, created_at")
    .eq("board_id", boardId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const pins = (data ?? []) as PinRow[];

  // Assign positions as 10,20,30... for easy future inserts
  let pos = 10;
  for (const p of pins) {
    const { error: updErr } = await supabase
      .from("pins")
      .update({ position: pos })
      .eq("id", p.id);

    if (updErr) throw new Error(updErr.message);
    pos += 10;
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return unauthorized("Not authenticated");
  }

  const contentType = req.headers.get("content-type") || "";

  let id = "";
  let direction = "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    id = asString(body.id).trim();
    direction = asString(body.direction).trim();
  } else {
    const form = await req.formData();
    id = asString(form.get("id")).trim();
    direction = asString(form.get("direction")).trim();
  }

  if (!id) {
    return badRequest("Missing id");
  }
  if (direction !== "up" && direction !== "down") {
    return badRequest("direction must be 'up' or 'down'");
  }

  // 1) Load the pin
  const { data: pin, error: pinErr } = await supabase
    .from("pins")
    .select("id, board_id, position, created_at")
    .eq("id", id)
    .maybeSingle<PinRow>();

  if (pinErr) {
    return badRequest(pinErr.message);
  }
  if (!pin) {
    return notFound("Pin not found");
  }

  // 2) If positions are missing/null, normalise for the whole board once
  if (pin.position == null) {
    try {
      await normalizePositions(supabase, pin.board_id);
    } catch (e: any) {
      return badRequest(e?.message || "Failed to normalize positions");
    }

    // reload pin after normalization
    const reload = await supabase
      .from("pins")
      .select("id, board_id, position, created_at")
      .eq("id", id)
      .maybeSingle<PinRow>();

    if (reload.error || !reload.data) {
      return badRequest(reload.error?.message || "Pin reload failed");
    }

    pin.position = reload.data.position;
  }

  // 3) Find neighbour
  let neighbour: PinRow | null = null;

  if (direction === "up") {
    const { data } = await supabase
      .from("pins")
      .select("id, board_id, position, created_at")
      .eq("board_id", pin.board_id)
      .lt("position", pin.position)
      .order("position", { ascending: false })
      .limit(1);

    neighbour = (data?.[0] as PinRow) ?? null;
  } else {
    const { data } = await supabase
      .from("pins")
      .select("id, board_id, position, created_at")
      .eq("board_id", pin.board_id)
      .gt("position", pin.position)
      .order("position", { ascending: true })
      .limit(1);

    neighbour = (data?.[0] as PinRow) ?? null;
  }

  // Nothing to swap with (already at top/bottom)
  if (!neighbour || neighbour.position == null || pin.position == null) {
    if (!contentType.includes("application/json")) {
      const back = req.headers.get("referer") || "/orgs";
      return NextResponse.redirect(back, { status: 303 });
    }
    return ok({ ok: true, moved: false });
  }

  // 4) Swap positions
  const aPos = pin.position;
  const bPos = neighbour.position;

  const { error: aErr } = await supabase.from("pins").update({ position: bPos }).eq("id", pin.id);
  if (aErr) return badRequest(aErr.message);

  const { error: bErr } = await supabase.from("pins").update({ position: aPos }).eq("id", neighbour.id);
  if (bErr) return badRequest(bErr.message);

  if (!contentType.includes("application/json")) {
    const back = req.headers.get("referer") || "/orgs";
    return NextResponse.redirect(back, { status: 303 });
  }

  return ok({ ok: true, moved: true });
}
