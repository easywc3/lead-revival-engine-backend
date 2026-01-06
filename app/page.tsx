export const dynamic = 'force-dynamic';

import Link from "next/link";

async function getLeads() {
  const res = await fetch("/api/leads", {
    cache: "no-store"
  });

  if (!res.ok) {
    return [];
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
          Root landing page
        </p>

        <div className="mt-8 rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Leads</h2>

          {leads.length === 0 ? (
            <p>No leads yet.</p>
          ) : (
            <ul>
              {leads.map((lead: any) => (
                <li key={lead.id}>
                  {lead.firstName} – {lead.phone} – {lead.state}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
