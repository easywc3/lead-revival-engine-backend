// app/dashboard/leads/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LeadsPage() {

  // Deployment-safe: direct DB call
  const leads = await prisma.lead.findMany({
    orderBy: {
      id: "asc"
    },
    include: {
      inboundMessages: true,
      outboundMessages: true
    }
  });

  function stateBadge(state: string) {

    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      border: "1px solid rgba(0,0,0,0.10)",
      background: "rgba(0,0,0,0.04)"
    };

    return <span style={base}>{state}</span>;
  }

  return (
    <main className="min-h-screen bg-white text-black">

      <div className="mx-auto max-w-5xl px-6 py-10">

        <h1 className="text-2xl font-bold mb-6">
          Leads Monitor
        </h1>

        {leads.length === 0 ? (
          <p>No leads yet.</p>
        ) : (
          <table className="w-full border-collapse bg-white">

            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">First Name</th>
                <th className="text-left py-2">Phone</th>
                <th className="text-left py-2">State</th>
                <th className="text-right py-2">Inbound</th>
                <th className="text-right py-2">Outbound</th>
              </tr>
            </thead>

            <tbody>

              {leads.map((lead: any) => {

                const inboundCount = lead.inboundMessages.length;
                const outboundCount = lead.outboundMessages.length;

                return (
                  <tr key={lead.id} className="border-b">

                    <td className="py-2 font-semibold">

                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="underline font-bold"
                      >
                        #{lead.id}
                      </Link>

                    </td>

                    <td className="py-2">
                      {lead.firstName ?? "Unknown"}
                    </td>

                    <td className="py-2">
                      {lead.phone}
                    </td>

                    <td className="py-2">
                      {stateBadge(lead.state)}
                    </td>

                    <td className="py-2 text-right">
                      {inboundCount}
                    </td>

                    <td className="py-2 text-right">
                      {outboundCount}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>
        )}

      </div>

    </main>
  );
}
