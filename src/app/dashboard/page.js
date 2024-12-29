import PlayerStatsTable from "./components/PlayerStatsTable";
import StatTypeTable from "./components/StatTypeTable";

export default async function DashboardPage() {
  // 1. Fetch lines from our local /api/lines route
  const linesRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/lines`, {
    cache: "no-store",
  });

  if (!linesRes.ok) {
    throw new Error("Failed to fetch lines");
  }

  const lines = await linesRes.json();

  if (!lines) {
    return <div>No lines found</div>;
  }

  // 2. For each line, fetch bets to calculate total volume
  const linesWithVolume = await Promise.all(
    lines.map(async (line) => {
      const betsRes = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/bets/${line.line_id}`,
        { cache: "no-store" }
      );

      // If bets fetch fails, gracefully set volume=0
      if (!betsRes.ok) {
        return { ...line, total_volume: 0 };
      }

      const bets = await betsRes.json();
      const totalVolume = bets.reduce((acc, bet) => acc + (bet.amount || 0), 0);

      return { ...line, total_volume: totalVolume };
    })
  );

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Betting Dashboard</h1>
      <PlayerStatsTable lines={linesWithVolume} />
      <StatTypeTable lines={linesWithVolume} />
    </main>
  );
}
