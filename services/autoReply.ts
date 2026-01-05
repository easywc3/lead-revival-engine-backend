import { prisma } from "@/lib/prisma";
import { generateContextualReply } from "@/services/messageEngine";
import { sendSms } from "@/services/sms";

/**
 * Automatically replies to an inbound message when allowed
 */
export async function autoReplyToInboundMessage(
  inboundMessageId: number
) {
  const inbound = await prisma.inboundMessage.findUnique({
    where: { id: inboundMessageId },
    include: { lead: true },
  });

  if (!inbound || !inbound.lead) return;

  const lead = inbound.lead;

  const reply = await generateContextualReply({
    leadId: lead.id,
    inboundText: inbound.body,
    intent: inbound.intent ?? "UNKNOWN",
  });

  if (!reply) return;

  await sendSms({
    to: lead.phone,
    body: reply,
    reason: "ai_contextual_reply",
  });
}
