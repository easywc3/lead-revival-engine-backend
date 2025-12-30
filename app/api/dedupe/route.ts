import { NextResponse } from "next/server";
import { dedupeLeadsByPhone } from "@/services/dedupe";

export async function POST() {
  const result = await dedupeLeadsByPhone();
  return NextResponse.json(result);
}
