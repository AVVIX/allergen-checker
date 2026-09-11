import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { reports } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.barcode !== "string" || typeof body.message !== "string") {
    return NextResponse.json(
      { error: "Se requiere 'barcode' y 'message'." },
      { status: 400 }
    );
  }

  const db = getDb();

  await db.insert(reports).values({
    barcode: body.barcode,
    message: body.message.slice(0, 1000),
    suggestedStatus: body.suggestedStatus ?? null,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
