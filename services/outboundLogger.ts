import { prisma } from "@/lib/prisma";

export async function logOutboundMessage(params: {
  leadId: number;
  body: string;
  reason: string;
}) {
  await prisma.outboundMessage.create({
    data: {
      leadId: params.leadId,
      body: params.body,
      reason: params.reason,
    },
  });
}
