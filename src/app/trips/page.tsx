"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: number;
  pickup: string;
  dropoff: string;
  trip_date: string;
  trip_time: string;
  passengers: number;
  status: string;
  fare: number | null; booked_via: string;
  customers: { name: string; phone: string } | null;
  drivers: { name: string } | null;
};

const statusStyle: Record<string, string> = {
  booked: "bg-yellow-100 text-yellow-800",
  assigned: "bg-green-100 text-green-800",
  done: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-200 text-gray-700",
};

const statusLabel: Record<string, string> = {
  booked: "Not assigned",
  assigned: "Assigned",
  done: "Done",
  cancelled: "Cancelled",
  no_show: "No-show",
};

function showDate(date: string, today: string) {
  if (date === today) return "Today";
  return new Date(date + "T00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [message, setMessage] = useState("Loading...");
  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase
        .from("trips")
        .select("id, pickup, dropoff, trip_date, trip_time, passengers, status, fare, booked_via, customers(name, phone), drivers(name)")
        .gte("trip_date", today)
        .order("trip_date")
        .order("trip_time");
      if (error) {
        setMessage("Could not load trips: " + error.message);
        return;
      }
      setTrips((data ?? []) as unknown as Trip[]);
      setMessage(data && data.length > 0 ? "" : "No trips yet. Tap + Add trip to add one.");
    }
    load();
  }, [router, today]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex flex-wrap items-center gap-y-2">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Trips</h1><Link href="/drivers" className="ml-auto mr-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">Drivers</Link><Link href="/customers" className="mr-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">Customers</Link>
<Link href="/summary" className="mr-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">Summary</Link>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Log out
          </button>
        </div>

        <Link
          href="/trips/new"
          className="mb-4 block rounded-lg bg-[#F5B800] p-3 text-center font-bold text-[#0F3D2E]"
        >
          + Add trip
        </Link>

        {message && <p className="text-gray-600">{message}</p>}

        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id}><Link href={`/trips/${t.id}`} className="block rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-bold text-gray-900">
                  {showDate(t.trip_date, today)} · {new Date("2000-01-01T" + t.trip_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[t.status] ?? ""}`}>
                  {statusLabel[t.status] ?? t.status}{t.booked_via === "whatsapp_link" ? " · via link" : ""}
                </span>
              </div>
              <p className="text-gray-800">{t.pickup} → {t.dropoff}</p>
              <p className="text-sm text-gray-600">
                {t.customers?.name} · {t.customers?.phone}
              </p>
              <p className="text-sm text-gray-600">
                Driver: {t.drivers?.name ?? "Not assigned"}
                {t.fare ? ` · ₹${t.fare}` : ""}
              </p>
            </Link></li>
          ))}
        </ul>
      </div>
    </main>
  );
}