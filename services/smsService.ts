import { prisma } from "@/lib/prisma";

type SendSmsOptions = {
  leadId?: number;
  reason?: string;
};

export async function sendSms(
  to: string,
  body: string,
  opts?: SendSmsOptions
) {
  if (!body || !body.trim()) {
    throw new Error("sendSms called with empty body");
  }

  // DEV MODE (no Twilio)
  if (process.env.NODE_ENV !== "production") {
    if (!opts?.leadId) {
      throw new Error("sendSms DEV mode requires leadId");
    }

    console.log("📨 DEV SMS (not sent)", {
      to,
      body,
    });

    await prisma.outboundMessage.create({
      data: {
        leadId: opts.leadId,
        body,
        status: "sent",
        reason: opts.reason ?? "dev_mode_no_twilio",
      },
    });

    return;
  }

  // 🚨 Production Twilio logic would live here
  throw new Error("Twilio not configured");
}
