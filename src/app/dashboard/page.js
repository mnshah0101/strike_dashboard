"use client";

import LineStatsDashboard from "./components/LineDashboard";

export default function DashboardPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Betting Dashboard</h1>
      <div className="space-y-4">
        <LineStatsDashboard />
      </div>
    </main>
  );
}
