import { prisma } from "@/lib/prisma";
import { generateContextualReply } from "@/services/messageEngine";
import { sendSms } from "@/services/sms";

/**
 * Automatically replies to an inbound message when allowed
 */
export async function autoReplyToInboundMessage(inboundMessageId: number) {
  const inbound = await prisma.inboundMessage.findUnique({
    where: { id: inboundMessageId },
    include: { lead: true },
  });

  if (!inbound || !inbound.lead) return;

  const lead = inbound.lead;

  // Generate AI reply using correct parameter shape
  const reply = await generateContextualReply({
    leadId: lead.id,
    inboundText: inbound.body,
  });

  if (!reply) return;

  await sendSms({
    to: lead.phone,
    body: reply,
  });
}
