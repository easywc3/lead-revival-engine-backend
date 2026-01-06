import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      {
        ok: true,
        hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasTwilioSid: Boolean(process.env.TWILIO_ACCOUNT_SID),
        port: process.env.PORT ?? null,
        nodeEnv: process.env.NODE_ENV ?? null
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? String(err)
      },
      { status: 500 }
    );
  }
}
