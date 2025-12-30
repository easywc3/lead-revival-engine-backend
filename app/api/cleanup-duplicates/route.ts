import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const duplicates = await prisma.$queryRaw<
    { phone: string; ids: number[] }[]
  >`
    SELECT phone, ARRAY_AGG(id ORDER BY id ASC) AS ids
    FROM "Lead"
    GROUP BY phone
    HAVING COUNT(*) > 1
  `;

  let deleted = 0;

  for (const row of duplicates) {
    const [, ...toDelete] = row.ids;

    if (toDelete.length > 0) {
      const result = await prisma.lead.deleteMany({
        where: {
          id: { in: toDelete },
          state: "STOPPED",
        },
      });

      deleted += result.count;
    }
  }

  return NextResponse.json({ deleted });
}
