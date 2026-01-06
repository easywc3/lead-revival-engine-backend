// app/page.tsx
import { prisma } from "@/lib/prisma";

export default async function Home() {

  // Direct Prisma query instead of internal HTTP
  const leads = await prisma.lead.findMany({
    orderBy: {
      id: "asc"
    }
  });

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-12">

        <h1 className="text-3xl font-bold">
          Lead Revival Engine – Operator Home
        </h1>

        <p className="mt-2 text-gray-600">
          Deterministic internal dashboard
        </p>

        <div className="mt-6 rounded-lg border p-4">
          <p>Total Leads in DB: <strong>{leads.length}</strong></p>

          <p className="mt-4">
            <a
              href="/dashboard/leads"
              className="underline font-semibold text-blue-600"
            >
              Go to Leads Dashboard
            </a>
          </p>

        </div>

      </div>
    </main>
  );
}
