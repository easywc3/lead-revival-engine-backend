import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/services/phone";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  try {
    // IMPORTANT: Read body ONCE as text, then parse.
    const raw = await req.text();
    let body: any;

    try {
      body = JSON.parse(raw);
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid JSON body",
          rawStartsWith: raw.slice(0, 120),
        },
        { status: 400 }
      );
    }

    if (!body?.firstName || !body?.phone) {
      return NextResponse.json(
        { ok: false, error: "firstName and phone required" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(body.phone);

    const lead = await prisma.lead.create({
      data: {
        firstName: String(body.firstName),
        phone,
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
