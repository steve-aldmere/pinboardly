// app/api/pins/reorder/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "Legacy endpoint removed. Use the new link_pins reorder flow." },
    { status: 410 }
  );
}
