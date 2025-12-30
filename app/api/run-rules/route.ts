import { NextResponse } from "next/server";
import { runInitialMessageRule } from "@/services/ruleRunner";

export async function POST() {
  const processed = await runInitialMessageRule();
  return NextResponse.json({ processed });
}
