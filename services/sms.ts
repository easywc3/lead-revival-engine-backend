import { prisma } from "@/lib/prisma";

/**
 * Safe SMS sender.
 * This function MUST NEVER throw.
 */
export async function sendSms(params: {
  to: string;
  body: string | null | undefined;
  reason?: string;
}) {
  const { to, body, reason } = params;

  // 🚨 HARD SAFETY: never throw on empty body
  if (!body || body.trim().length === 0) {
    console.warn("[sendSms skipped] empty body", {
      to,
      reason,
    });
    return;
  }

  // DEV MODE — log instead of sending
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV SMS]", {
      to,
      body: body.trim(),
      reason,
    });

    // Still log outbound message to DB for visibility
    try {
      await prisma.outboundMessage.create({
        data: {
          lead: {
            connect: { phone: to },
          },
          body: body.trim(),
          reason: reason ?? "dev_send",
        },
      });
    } catch (err) {
      console.error("[sendSms dev log failed]", err);
    }

    return;
  }

  // 🚧 PRODUCTION SEND (Twilio)
  // Keep this guarded as well
  try {
    const twilio = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await twilio.messages.create({
      to,
      from: process.env.TWILIO_FROM,
      body: body.trim(),
    });

    await prisma.outboundMessage.create({
      data: {
        lead: {
          connect: { phone: to },
        },
        body: body.trim(),
        reason: reason ?? "twilio_send",
      },
    });
  } catch (err) {
    console.error("[sendSms production error]", err);
  }
}
