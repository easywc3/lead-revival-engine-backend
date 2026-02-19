import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let leads: any[] = [];
  let error: string | null = null;

  try {
    leads = await prisma.lead.findMany({ orderBy: { createdAt: "asc" } });
  } catch (e: any) {
    error = e?.message ?? String(e);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Lead Revival Engine</h1>

        {error ? (
          <div className="mt-6 rounded border border-red-300 bg-red-50 p-4">
            <div className="font-semibold">Homepage DB query failed</div>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        ) : leads.length === 0 ? (
          <p className="mt-6">No leads yet.</p>
        ) : (
          <table className="mt-6 border-collapse">
            <thead>
              <tr className="font-semibold border-b">
                <td className="px-2 py-1">Name</td>
                <td className="px-2 py-1">Phone</td>
                <td className="px-2 py-1">State</td>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b">
                  <td className="px-2 py-1">{lead.firstName}</td>
                  <td className="px-2 py-1">{lead.phone}</td>
                  <td className="px-2 py-1">{lead.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

