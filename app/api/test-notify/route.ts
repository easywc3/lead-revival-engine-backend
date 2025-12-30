import { NextResponse } from "next/server";
import { notifyHuman } from "@/services/notifyHuman";

export async function POST() {
  await notifyHuman({
    firstName: "Test Lead",
    phone: "+18324747380",
    message: "Yes, I'm interested. Can you explain?",
    confidence: 0.95,
  });

  return NextResponse.json({ status: "sent" });
}
