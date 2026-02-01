import { NextRequest, NextResponse } from "next/server";
import { generateLabFromNotes } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  if (!notes || typeof notes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }
  try {
    const data = await generateLabFromNotes(notes);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
