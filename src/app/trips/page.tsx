"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Driver = { id: number; name: string; car_number: string | null };

export default function TripsPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase
        .from("drivers")
        .select("id, name, car_number")
        .order("id");
      if (error) {
        setMessage("Could not load cars: " + error.message);
        return;
      }
      setDrivers(data ?? []);
      setMessage("");
    }
    load();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Trips</h1>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Log out
          </button>
        </div>
        <p className="mb-4 rounded-lg bg-[#F5B800]/20 p-3 text-sm text-gray-800">
          Trips screen coming next. For now, here are your cars:
        </p>
        {message && <p className="text-gray-600">{message}</p>}
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.id} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="font-semibold text-gray-900">{d.name}</p>
              <p className="text-sm text-gray-600">{d.car_number}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}