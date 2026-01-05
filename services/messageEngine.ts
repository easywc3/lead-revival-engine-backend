import { prisma } from "@/lib/prisma";
import { rewriteWithAI } from "@/services/aiRewrite";

type InitialMessageParams = {
  leadId: number;
  firstName: string | null;
  intent: string;
};

type ContextualReplyParams = {
  leadId: number;
  inboundText: string;
  intent: string;
};

/**
 * ✅ INITIAL OUTREACH MESSAGE
 * Deterministic → then AI rewrite
 */
export async function generateInitialMessage(
  params: InitialMessageParams
) {
  const name = params.firstName || "there";

  const draftMap: Record<string, string[]> = {
    INTERESTED: [
      `Hi ${name}, glad to hear that. What kind of property are you looking for?`,
      `Hi ${name}, awesome — can you tell me a bit about what you're looking for?`,
    ],
    UNKNOWN: [
      `Hi ${name}, happy to explain. What questions do you have?`,
      `Hi ${name}, no problem — what would you like to know?`,
    ],
    CONFUSED: [
      `Sorry about that — this is regarding a property you asked about earlier.`,
      `Totally fair question — I'm following up on a home inquiry from earlier.`,
    ],
    DEFER: [
      `Sounds good — I can check back later. When works best for you?`,
    ],
  };

  const drafts = draftMap[params.intent] || [
    `Hi ${name}, just following up to see if you had any questions.`,
  ];

  const draft =
    drafts[Math.floor(Math.random() * drafts.length)];

  return rewriteWithAI({
    draft,
    intent: params.intent,
  });
}

/**
 * ✅ CONTEXTUAL FOLLOW-UP REPLY
 * Used after inbound messages
 */
export async function generateContextualReply(
  params: ContextualReplyParams
) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.leadId },
  });

  const name = lead?.firstName || "there";

  const draft = `Hi ${name}, thanks for your message. ${params.inboundText}`;

  return rewriteWithAI({
    draft,
    intent: params.intent,
  });
}
