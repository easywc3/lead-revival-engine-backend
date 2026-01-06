// app/dashboard/leads/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  // Direct Prisma query
  const lead = await prisma.lead.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      inboundMessages: {
        orderBy: { id: "asc" }
      },
      outboundMessages: {
        orderBy: { id: "asc" }
      }
    }
  });

  if (!lead) {
    return (
      <main style={{ padding: 24 }}>
        <p>Lead not found.</p>
        <Link href="/dashboard/leads">Back</Link>
      </main>
    );
  }

  function chip(text: string) {

    return (
      <span style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.04)"
      }}>
        {text}
      </span>
    );
  }

  function formatDate(ts: string | Date) {

    const d = typeof ts === "string"
      ? new Date(ts)
      : ts;

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleString();
  }

  const inbound = (lead.inboundMessages ?? [])
    .map((m: any) => ({
      id: `in_${m.id}`,
      dir: "in",
      body: m.body,
      intent: m.intent,
      at: m.createdAt
    }));

  const outbound = (lead.outboundMessages ?? [])
    .map((m: any) => ({
      id: `out_${m.id}`,
      dir: "out",
      body: m.body,
      reason: m.reason,
      at: m.sentAt ?? m.createdAt
    }));

  const timeline = [...inbound, ...outbound]
    .sort((a, b) => {
      return new Date(a.at).getTime() -
             new Date(b.at).getTime();
    });

  return (
    <main className="min-h-screen bg-white text-black">

      <div className="mx-auto max-w-4xl px-6 py-12">

        <h1>
          Lead Detail #{lead.id}
        </h1>

        <div className="mt-6 rounded-lg border p-4">

          <p>Name: <strong>{lead.firstName ?? "Unknown"}</strong></p>
          <p>Phone: <strong>{lead.phone}</strong></p>
          <p>State: {chip(lead.state)}</p>

        </div>

        <h2 className="mt-8 mb-4">
          Message Timeline
        </h2>

        {timeline.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          timeline.map((m: any) => {

            const isInbound = m.dir === "in";

            return (
              <div key={m.id}
                style={{
                  marginTop: 10,
                  padding: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: isInbound
                    ? "rgba(59,130,246,0.03)"
                    : "rgba(16,185,129,0.03)"
                }}
              >

                <div style={{ fontSize: 12 }}>
                  {isInbound ? "Inbound" : "Outbound"}
                  {m.intent ?? m.reason}
                </div>

                <div style={{ fontSize: 12 }}>
                  {formatDate(m.at)}
                </div>

                <div style={{ whiteSpace: "pre-wrap" }}>
                  {m.body}
                </div>

              </div>
            );
          })
        )}

      </div>

    </main>
  );
}
