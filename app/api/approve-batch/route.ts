import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId } = body;

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.lead.updateMany({
      where: {
        importBatchId: batchId,
        state: "NEW",
      },
      data: {
        state: "READY",
      },
    });

    return NextResponse.json({
      approved: result.count,
      batchId,
    });
  } catch (err) {
    console.error("Approve batch failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
