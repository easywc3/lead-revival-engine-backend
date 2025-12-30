import Link from "next/link";

async function getLeads() {
  const res = await fetch("http://localhost:3000/api/internal/leads", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
}

function stateBadge(state: string) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(0,0,0,0.04)",
  };

  const map: Record<string, React.CSSProperties> = {
    NEW: { background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" },
    READY: { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" },
    CONTACTED: { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" },
    RESPONDED: { background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" },
    QUALIFIED: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" },
    HANDOFF: { background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" },
    STOPPED: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" },
  };

  return <span style={{ ...base, ...(map[state] ?? {}) }}>{state}</span>;
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Leads</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(0,0,0,0.65)" }}>
            Monitor inbound/outbound activity and lead state.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
          Total: <strong>{Array.isArray(leads) ? leads.length : 0}</strong>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 12,
          overflow: "hidden",
          background: "white",
          boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.03)" }}>
              <th style={thLeft}>ID</th>
              <th style={thLeft}>Name</th>
              <th style={thLeft}>Phone</th>
              <th style={thLeft}>State</th>
              <th style={thRight}>Inbound</th>
              <th style={thRight}>Outbound</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead: any, idx: number) => {
              const name = lead.firstName ?? "Unknown";
              const inbound = lead?._count?.inboundMessages ?? 0;
              const outbound = lead?._count?.outboundMessages ?? 0;

              return (
                <tr
                  key={lead.id}
                  style={{
                    background: idx % 2 === 0 ? "white" : "rgba(0,0,0,0.012)",
                  }}
                >
                  <td style={tdLeft}>
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      style={{
                        textDecoration: "none",
                        fontWeight: 700,
                        color: "inherit",
                      }}
                    >
                      #{lead.id}
                    </Link>
                  </td>

                  <td style={tdLeft}>{name}</td>
                  <td style={tdLeft} title={lead.phone}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                      {lead.phone}
                    </span>
                  </td>
                  <td style={tdLeft}>{stateBadge(lead.state)}</td>
                  <td style={tdRight}>{inbound}</td>
                  <td style={tdRight}>{outbound}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
        Tip: click an ID to see the full conversation and message timeline.
      </div>
    </div>
  );
}

const thLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 700,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const thRight: React.CSSProperties = {
  ...thLeft,
  textAlign: "right",
};

const tdLeft: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  verticalAlign: "top",
};

const tdRight: React.CSSProperties = {
  ...tdLeft,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};
