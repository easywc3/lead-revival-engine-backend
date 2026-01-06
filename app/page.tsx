// app/page.tsx
import { NextResponse } from "next/server";

async function getLeads() {
  const res = await fetch("/api/leads", {
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

        {leads.length === 0 ? (
          <p>No leads yet.</p>
        ) : (
          <table>
            <tbody>
              {leads.map((lead: any) => (
                <tr key={lead.id}>
                  <td>{lead.firstName}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
