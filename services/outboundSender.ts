import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";

const MAX_RETRIES = 3;

export async function sendOutboundBatch() {
  const leads = await prisma.lead.findMany({
    where: {
      state: { in: ["NEW", "CONTACTED"] },
      retryCount: { lt: MAX_RETRIES },
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  const results = [];

  for (const lead of leads) {
    try {
      const body =
        lead.state === "NEW"
          ? "Hey — just wanted to follow up. Are you still thinking about buying or selling?"
          : "Quick check-in — any thoughts since we last connected?";

      await sendSms({
        to: lead.phone,
        body,
      });

      await prisma.outboundMessage.create({
        data: {
          leadId: lead.id,
          body,
          reason: "automated_follow_up",
        },
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          state: "CONTACTED",
          hasBeenMessaged: true,
          lastAttemptAt: new Date(),
        },
      });

      results.push({ leadId: lead.id, status: "sent" });
    } catch (err) {
      console.error("Outbound send error:", err);

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          retryCount: { increment: 1 },
          lastErrorAt: new Date(),
          lastErrorCode: "SEND_FAILED",
        },
      });

      results.push({ leadId: lead.id, status: "failed" });
    }
  }

  return results;
}
