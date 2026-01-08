// app/api/pins/delete/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "Legacy endpoint removed. Use /api/pins with DELETE instead." },
    { status: 410 }
  );
}
