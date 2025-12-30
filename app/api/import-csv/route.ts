import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

type CsvLeadRow = {
  firstName?: string;
  phone?: string;
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvLeadRow[];

    let created = 0;
    let skipped = 0;

    for (const row of records) {
      const firstName = row.firstName?.trim();
      const phone = row.phone?.replace(/[^\d+]/g, "");

      if (!firstName || !phone) {
        skipped++;
        continue;
      }

      await prisma.lead.create({
        data: {
          firstName,
          phone,
          state: "NEW",
        },
      });

      created++;
    }

    return NextResponse.json({
      status: "ok",
      created,
      skipped,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 }
    );
  }
}
