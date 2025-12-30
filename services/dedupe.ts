import { prisma } from "@/lib/prisma";

export async function dedupeLeadsByPhone() {
  const duplicates = await prisma.$queryRaw<
    { phone: string; ids: number[] }[]
  >`
    SELECT phone, ARRAY_AGG(id ORDER BY id ASC) AS ids
    FROM "Lead"
    GROUP BY phone
    HAVING COUNT(*) > 1
  `;

  let stopped = 0;

  for (const row of duplicates) {
    const [, ...duplicateIds] = row.ids;

    if (duplicateIds.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: duplicateIds } },
        data: { state: "STOPPED" },
      });

      stopped += duplicateIds.length;
    }
  }

  return { stopped };
}
