import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Lead Revival Engine</h1>

        {leads.length === 0 ? (
          <p>No leads yet.</p>
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
