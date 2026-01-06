import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Internal operator tools
        </p>

        <ul className="mt-6 space-y-2 list-disc pl-6">

          <li>
            <Link
              href="/dashboard/leads"
              className="underline text-blue-600 font-semibold"
            >
              View Leads
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/cleanup-duplicates"
              className="underline text-blue-600 font-semibold"
            >
              Cleanup Duplicate Leads
            </Link>
          </li>

        </ul>

      </div>
    </main>
  );
}
