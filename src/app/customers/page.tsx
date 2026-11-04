"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string;
  trips: { count: number }[];
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, trips(count)")
        .order("name");
      if (error) {
        setMessage("Could not load customers: " + error.message);
        return;
      }
      setCustomers((data ?? []) as unknown as Customer[]);
      setMessage(data && data.length > 0 ? "" : "No customers yet.");
    }
    load();
  }, [router]);

  const s = search.trim().toLowerCase();
  const shown = customers.filter(
    (c) => !s || c.name.toLowerCase().includes(s) || c.phone.includes(s)
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Customers</h1>
          <Link
            href="/trips"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Back
          </Link>
        </div>

        <input
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />

        {message && <p className="text-gray-600">{message}</p>}

        <ul className="space-y-2">
          {shown.map((c) => (
            <li key={c.id} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-sm text-gray-600">
                {c.phone} · {c.trips?.[0]?.count ?? 0} trips
              </p>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/trips/new?name=${encodeURIComponent(c.name)}&phone=${encodeURIComponent(c.phone)}`}
                  className="rounded-lg bg-[#F5B800] px-3 py-2 text-sm font-bold text-[#0F3D2E]"
                >
                  Book again
                </Link>
                <a
                  href={`tel:${c.phone}`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                >
                  Call
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}