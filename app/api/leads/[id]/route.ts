import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function normalizePhone(phone: string): string {
  // VERY simple normalization (US-only for now)
  // You can replace this later with libphonenumber-js
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return phone; // fallback — let Twilio reject if invalid
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const leadId = Number(id);

    if (Number.isNaN(leadId)) {
      return NextResponse.json(
        { error: "Invalid lead id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const rawPhone = body.phone;

    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json(
        { error: "phone is required" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { phone },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    // ✅ Handle duplicate phone cleanly
if (
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as any).code === "P2002"
) {

      return NextResponse.json(
        { error: "Phone number already exists on another lead" },
        { status: 409 }
      );
    }

    console.error("PATCH /api/leads/[id] error:", err);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
