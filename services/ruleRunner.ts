import { prisma } from "@/lib/prisma";
import { generateInitialMessage } from "@/services/messageEngine";
import { sendSms } from "@/services/sms";

export async function runInitialMessageRule() {
  const leads = await prisma.lead.findMany({
    where: {
      state: "NEW",
      hasBeenMessaged: false,
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  for (const lead of leads) {
    try {
      if (!lead.phone) continue;

      // 1️⃣ Generate AI message
      const message = await generateInitialMessage({
        leadId: lead.id,
      });

      if (!message || !message.trim()) {
        throw new Error("AI returned empty message");
      }

      // 2️⃣ Send (DEV-safe)
      await sendSms(lead.phone, message, {
        leadId: lead.id, // ✅ THIS WAS MISSING BEFORE
        sentBy: "ai",
        reason: "initial_outreach",
      });

      // 3️⃣ Mark lead contacted
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          hasBeenMessaged: true,
          state: "CONTACTED",
          lastAttemptAt: new Date(),
        },
      });

    } catch (err: any) {
      console.error(`❌ Failed initial message for lead ${lead.id}`, err);

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastErrorAt: new Date(),
          lastErrorCode: err?.message ?? "unknown_error",
        },
      });
    }
  }
}
