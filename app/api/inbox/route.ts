import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InboundMessage, OutboundMessage } from "@prisma/client";

export async function GET() {
  try {
    const inbound: InboundMessage[] = await prisma.inboundMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const outbound: OutboundMessage[] = await prisma.outboundMessage.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    const messages = [
      ...inbound.map((m: InboundMessage) => ({
        id: `in-${m.id}`,
        from: m.fromPhone,
        body: m.body,
        createdAt: m.createdAt,
        direction: "inbound" as const,
        intent: m.intent,
      })),
      ...outbound.map((m: OutboundMessage) => ({
        id: `out-${m.id}`,
        from: "system",
        body: m.body,
        createdAt: m.sentAt,
        direction: "outbound" as const,
        reason: m.reason,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json(messages);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load inbox" },
      { status: 500 }
    );
  }
}
