import { rewriteWithAI } from "@/services/aiRewrite";

type InitialMessageParams = {
  leadId: number;
  firstName: string | null;
  intent: string;
};

export async function generateInitialMessage(params: InitialMessageParams) {
  const name = params.firstName || "there";

  // Deterministic draft (this is IMPORTANT)
  const draftMap: Record<string, string[]> = {
    INTERESTED: [
      `Hi ${name}, glad to hear that. What kind of property are you looking for?`,
      `Hi ${name}, awesome — can you tell me a bit about what you're looking for?`,
    ],
    UNKNOWN: [
      `Hi ${name}, happy to explain. What questions do you have?`,
      `Hi ${name}, no problem — what would you like to know?`,
    ],
    SKEPTICAL: [
      `Totally fair question. Yes, this is legit — happy to explain how it works.`,
      `I get the concern. I'm reaching out about a property you asked about earlier.`,
    ],
    DEFER: [
      `Sounds good — I can check back later. When works best for you?`,
    ],
  };

  const drafts = draftMap[params.intent] || [
    `Hi ${name}, just following up to see if you had any questions.`,
  ];

  // Controlled randomness
  const draft = drafts[Math.floor(Math.random() * drafts.length)];

  // AI rewrite layer
  const rewritten = await rewriteWithAI({
    draft,
    intent: params.intent,
  });

  return rewritten;
}
