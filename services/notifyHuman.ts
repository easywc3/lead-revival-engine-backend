import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

type Params = {
  leadId: number;
  reason: string;
  inboundText: string;
};

export async function notifyHuman({ leadId, reason, inboundText }: Params) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `🔥 Lead ready for follow-up (${lead.phone})`;

  const body = `
Lead ID: ${lead.id}
Phone: ${lead.phone}
State: ${lead.state}

Trigger: ${reason}

Last message:
"${inboundText}"
`;

  try {
    await transporter.sendMail({
      from: process.env.NOTIFY_EMAIL,
      to: process.env.NOTIFY_EMAIL,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("[notifyHuman failed]", err);
  }
}
