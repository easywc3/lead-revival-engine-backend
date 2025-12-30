import { prisma } from "@/lib/prisma";

export type ConversationContext = {
  leadId: number;
  leadFirstName: string | null;
  leadPhone: string;
  leadState: string;
  hasBeenMessaged: boolean;
  recentTranscript: string; // compact text to feed AI
  stats: {
    inboundCount: number;
    outboundCount: number;
  };
};

function safeLine(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

export async function buildConversationContext(params: { leadId: number }): Promise<ConversationContext> {
  const { leadId } = params;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      firstName: true,
      phone: true,
      state: true,
      hasBeenMessaged: true,
    },
  });

  if (!lead) {
    throw new Error("lead_not_found");
  }

  // Pull last few messages for “memory”
  const inbound = await prisma.inboundMessage.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { body: true, createdAt: true },
  });

  const outbound = await prisma.outboundMessage.findMany({
    where: { leadId },
    orderBy: { sentAt: "desc" },
    take: 6,
    select: { body: true, sentAt: true, reason: true },
  });

  // Merge into a compact transcript (most recent last)
  const transcriptParts: string[] = [];

  const inboundChron = [...inbound].reverse();
  const outboundChron = [...outbound].reverse();

  // We don’t have perfect interleaving timestamps here, but for prompt memory this is “good enough”
  for (const m of outboundChron) {
    transcriptParts.push(`Agent: ${safeLine(m.body)}`);
  }
  for (const m of inboundChron) {
    transcriptParts.push(`Lead: ${safeLine(m.body)}`);
  }

  const recentTranscript = transcriptParts.slice(-10).join("\n");

  return {
    leadId: lead.id,
    leadFirstName: lead.firstName ?? null,
    leadPhone: lead.phone,
    leadState: String(lead.state),
    hasBeenMessaged: Boolean(lead.hasBeenMessaged),
    recentTranscript,
    stats: { inboundCount: inbound.length, outboundCount: outbound.length },
  };
}
