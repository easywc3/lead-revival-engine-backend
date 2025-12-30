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
  const body = await req.json();

  if (!body.firstName || !body.phone) {
    return NextResponse.json(
      { error: "firstName and phone required" },
      { status: 400 }
    );
  }

  const phone = normalizePhone(body.phone);

  const lead = await prisma.lead.create({
    data: {
      firstName: body.firstName,
      phone,
    },
  });

  return NextResponse.json(lead);
}
