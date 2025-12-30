async function getLead(id: string) {
  const res = await fetch(`http://localhost:3000/api/internal/leads/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch lead");
  }

  return res.json();
}

function chip(text: string) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.04)",
      }}
    >
      {text}
    </span>
  );
}

function formatDate(ts: string | Date) {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ REQUIRED IN NEXT 16
  const lead = await getLead(id);

  const name = lead.firstName ?? "Unknown";

  const inbound = (lead.inboundMessages ?? []).map((m: any) => ({
    id: `in_${m.id}`,
    dir: "in" as const,
    body: m.body,
    metaLeft: m.intent ? `[${m.intent}]` : "[INBOUND]",
    at: m.createdAt,
  }));

  const outbound = (lead.outboundMessages ?? []).map((m: any) => ({
    id: `out_${m.id}`,
    dir: "out" as const,
    body: m.body,
    metaLeft: m.reason ? `[${m.reason}]` : "[OUTBOUND]",
    at: m.sentAt ?? m.createdAt,
  }));

  const timeline = [...inbound, ...outbound].sort((a, b) => {
    const ta = new Date(a.at).getTime();
    const tb = new Date(b.at).getTime();
    return ta - tb;
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>
            Lead <span style={{ color: "rgba(0,0,0,0.55)" }}>#{lead.id}</span>
          </h1>
          <p style={{ margin: "6px 0 0", color: "rgba(0,0,0,0.65)" }}>
            Full conversation timeline for this lead.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {chip(lead.state)}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 12,
          background: "white",
          boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
          padding: 16,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={label}>Name</div>
            <div style={value}>{name}</div>
          </div>
          <div>
            <div style={label}>Phone</div>
            <div style={{ ...value, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
              {lead.phone}
            </div>
          </div>
          <div>
            <div style={label}>Source</div>
            <div style={value}>{lead.source ?? "-"}</div>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>Timeline</h2>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 12,
          overflow: "hidden",
          background: "white",
          boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
        }}
      >
        {timeline.length === 0 ? (
          <div style={{ padding: 16, color: "rgba(0,0,0,0.65)" }}>No messages yet.</div>
        ) : (
          timeline.map((m: any) => {
            const isInbound = m.dir === "in";
            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  gap: 12,
                  padding: 14,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  background: isInbound ? "rgba(59,130,246,0.03)" : "rgba(16,185,129,0.03)",
                }}
              >
                <div style={{ color: "rgba(0,0,0,0.65)", fontSize: 12 }}>
                  <div style={{ fontWeight: 800, color: "rgba(0,0,0,0.70)" }}>
                    {isInbound ? "Inbound" : "Outbound"} {m.metaLeft ? <span style={{ fontWeight: 700 }}> {m.metaLeft}</span> : null}
                  </div>
                  <div style={{ marginTop: 4 }}>{formatDate(m.at)}</div>
                </div>

                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(0,0,0,0.55)",
};

const value: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  fontWeight: 700,
};
