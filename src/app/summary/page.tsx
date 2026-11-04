"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Row = {
  trip_date: string;
  status: string;
  fare: number | null;
  drivers: { name: string } | null;
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-CA");
}

function rupees(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function SummaryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [message, setMessage] = useState("Loading...");

  const now = new Date();
  const today = fmt(now);
  const monthStart = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek));
  const from = weekStart < monthStart ? weekStart : monthStart;

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase
        .from("trips")
        .select("trip_date, status, fare, drivers(name)")
        .gte("trip_date", from)
        .lte("trip_date", today);
      if (error) {
        setMessage("Could not load summary: " + error.message);
        return;
      }
      setRows((data ?? []) as unknown as Row[]);
      setMessage("");
    }
    load();
  }, [router, from, today]);

  const start = period === "week" ? weekStart : monthStart;
  const inPeriod = rows.filter((r) => r.trip_date >= start);
  const done = inPeriod.filter((r) => r.status === "done");
  const earnings = done.reduce((sum, r) => sum + (r.fare ?? 0), 0);
  const cancelled = inPeriod.filter((r) => r.status === "cancelled").length;
  const noShows = inPeriod.filter((r) => r.status === "no_show").length;

  const byDriver: Record<string, { trips: number; earnings: number }> = {};
  for (const r of done) {
    const name = r.drivers?.name ?? "Not assigned";
    if (!byDriver[name]) byDriver[name] = { trips: 0, earnings: 0 };
    byDriver[name].trips += 1;
    byDriver[name].earnings += r.fare ?? 0;
  }
  const driverList = Object.entries(byDriver).sort((a, b) => b[1].earnings - a[1].earnings);

  const tab = (p: "week" | "month") =>
    `flex-1 rounded-lg p-2 text-sm font-bold ${period === p ? "bg-[#0F3D2E] text-white" : "bg-white text-gray-700 border border-gray-300"}`;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Summary</h1>
          <Link
            href="/trips"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Back
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <button onClick={() => setPeriod("week")} className={tab("week")}>This week</button>
          <button onClick={() => setPeriod("month")} className={tab("month")}>This month</button>
        </div>

        {message && <p className="mb-4 text-gray-600">{message}</p>}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Trips done</p>
            <p className="text-2xl font-bold text-gray-900">{done.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{rupees(earnings)}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{cancelled}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">No-shows</p>
            <p className="text-2xl font-bold text-gray-900">{noShows}</p>
          </div>
        </div>

        <h2 className="mb-2 font-bold text-gray-900">By driver (done trips)</h2>
        {driverList.length === 0 && <p className="text-gray-600">No completed trips yet.</p>}
        <ul className="space-y-2">
          {driverList.map(([name, d]) => (
            <li key={name} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
              <div>
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="text-sm text-gray-600">{d.trips} trips</p>
              </div>
              <p className="font-bold text-gray-900">{rupees(d.earnings)}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-gray-500">
          Earnings count only trips marked Done that have a fare.
        </p>
      </div>
    </main>
  );
}