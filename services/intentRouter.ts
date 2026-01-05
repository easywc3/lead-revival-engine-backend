import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";
import { notifyHuman } from "@/services/notifyHuman";
import { buildConversationContext } from "@/services/conversationContext";
import { generateAIReply } from "@/services/aiResponder";
import type { IntentResult } from "@/services/intentClassifier";

type Params = {
  leadId: number;
  intentResult: IntentResult;
  inboundText: string;
};

/**
 * Production intent router
 * - AI handles early conversation
 * - Human handoff on strong or explicit intent
 * - state === "RESPONDED" → human owns lead
 */
export async function applyIntentToLead({
  leadId,
  intentResult,
  inboundText,
}: Params): Promise<
  | { status: "handoff" }
  | { status: "replied" }
  | { status: "no_state_change" }
> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return { status: "no_state_change" };

  // 🛑 Human already owns lead
  if (lead.state === "RESPONDED") {
    return { status: "no_state_change" };
  }

  const text = inboundText.toLowerCase();
  const { intent, confidence, signals } = intentResult;

  // 🔥 Explicit human-language overrides AI uncertainty
  const explicitHumanRequest =
    text.includes("talk to someone") ||
    text.includes("talk to a person") ||
    text.includes("call me") ||
    text.includes("speak to someone") ||
    text.includes("can we talk") ||
    text.includes("next steps");

const signalList = signals as string[];

const wantsHuman =
  explicitHumanRequest ||
  intent === "INTERESTED" ||
  signalList.includes("CALL_REQUEST") ||
  signalList.includes("READY_TO_MOVE") ||
  signalList.includes("PRICE_SPECIFIC") ||
  signalList.includes("TIMELINE_SOON");


  // 🛑 OPT OUT
  if (intent === "OPT_OUT") {
    await prisma.lead.update({
      where: { id: leadId },
      data: { state: "STOPPED" },
    });

    await sendSms({
      to: lead.phone,
      body: "Got it — I’ll stop texting. Take care.",
      reason: "opt_out",
    });

    return { status: "replied" };
  }

  // 🤝 HUMAN HANDOFF
  if (wantsHuman && (explicitHumanRequest || confidence >= 0.4)) {
    const handoffReason = explicitHumanRequest
      ? "EXPLICIT_HANDOFF_REQUEST"
      : intent;

    await prisma.lead.update({
      where: { id: leadId },
      data: { state: "RESPONDED" },
    });

    await notifyHuman({
      leadId,
      reason: handoffReason,
      inboundText,
    });

    await sendSms({
      to: lead.phone,
      body: "Thanks — I’ll have someone follow up with you shortly.",
      reason: "handoff_ack",
    });

    return { status: "handoff" };
  }

  // 🤖 AI CONTINUES CONVERSATION
  if (!lead.hasBeenMessaged || signalList.includes("FORCE_REPLY")) {
    const ctx = await buildConversationContext({ leadId });

    const reply = await generateAIReply({
      inboundText,
      intent: intentResult,
      ctx,
    });

    if (!reply) return { status: "no_state_change" };

    await sendSms({
      to: lead.phone,
      body: reply,
      reason: "ai_reply",
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        hasBeenMessaged: true,
        state: "CONTACTED",
      },
    });

    return { status: "replied" };
  }

  return { status: "no_state_change" };
}
