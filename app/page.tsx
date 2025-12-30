async function getLeads() {
  const res = await fetch("http://localhost:3000/api/leads", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
}

export default async function Home() {
  const leads = await getLeads();

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Lead Revival Engine</h1>
        <p className="mt-2 text-gray-600">
          Internal operator dashboard (MVP)
        </p>

        <div className="mt-8 rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Leads</h2>

          {leads.length === 0 ? (
            <p className="text-gray-500">No leads yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">State</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b">
                    <td className="py-2">{lead.id}</td>
                    <td className="py-2">{lead.firstName}</td>
                    <td className="py-2">{lead.phone}</td>
                    <td className="py-2">{lead.state}</td>
                    <td className="py-2">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
