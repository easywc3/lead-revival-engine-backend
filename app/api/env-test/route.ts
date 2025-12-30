import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
    openaiKeyPrefix: process.env.OPENAI_API_KEY?.slice(0, 5) ?? null,
  });
}
