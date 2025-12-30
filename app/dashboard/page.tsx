import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <ul>
        <li>
          <Link href="/dashboard/leads">View Leads</Link>
        </li>
      </ul>
    </div>
  );
}
