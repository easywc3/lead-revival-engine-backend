import { prisma } from "@/lib/prisma";

const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function acquireSendLock(leadId: number): Promise<boolean> {
  const now = new Date();
  const expiresBefore = new Date(now.getTime() - LOCK_TTL_MS);

  const result = await prisma.lead.updateMany({
    where: {
      id: leadId,
      OR: [
        { sendLockAt: null },
        { sendLockAt: { lt: expiresBefore } },
      ],
    },
    data: {
      sendLockAt: now,
    },
  });

  return result.count === 1;
}

export async function releaseSendLock(leadId: number) {
  await prisma.lead.update({
    where: { id: leadId },
    data: { sendLockAt: null },
  });
}
