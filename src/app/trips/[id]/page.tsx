"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Driver = {
  id: number;
  name: string;
  phone: string;
  car_number: string | null;
  is_own_car: boolean;
};

type Trip = {
  id: number;
  pickup: string;
  dropoff: string;
  trip_date: string;
  trip_time: string;
  passengers: number;
  status: string;
  fare: number | null;
  notes: string | null;
  driver_id: number | null;
  customers: { name: string; phone: string } | null;
};

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length === 10 ? "91" + digits : digits;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function niceDate(date: string) {
  return new Date(date + "T00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function niceTime(time: string) {
  return new Date("2000-01-01T" + time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState("Loading...");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const { data: tripData, error } = await supabase
      .from("trips")
      .select("id, pickup, dropoff, trip_date, trip_time, passengers, status, fare, notes, driver_id, customers(name, phone)")
      .eq("id", params.id)
      .single();
    if (error) {
      setMessage("Could not load trip: " + error.message);
      return;
    }
    const { data: driverData } = await supabase
      .from("drivers")
      .select("id, name, phone, car_number, is_own_car")
      .eq("active", true)
      .order("id");
    setTrip(tripData as unknown as Trip);
    setDrivers((driverData ?? []) as Driver[]);
    setMessage("");
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function assign(driverId: number) {
    setSaving(true);
    const { error } = await supabase
      .from("trips")
      .update({ driver_id: driverId, status: "assigned" })
      .eq("id", params.id);
    setSaving(false);
    if (error) {
      setMessage("Could not assign: " + error.message);
      return;
    }
    load();
  }
  async function setStatus(status: string) {
    let cancel_reason: string | null = null;
    if (status === "cancelled") {
      const reason = window.prompt("Reason for cancelling? (optional)");
      if (reason === null) return;
      cancel_reason = reason;
    }
    setSaving(true);
    const { error } = await supabase
      .from("trips")
      .update({ status, cancel_reason })
      .eq("id", params.id);
    setSaving(false);
    if (error) {
      setMessage("Could not update: " + error.message);
      return;
    }
    load();
  }
 

 if (!trip) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <p className="mx-auto max-w-md text-gray-600">{message}</p>
      </main>
    );
  }

  const driver = drivers.find((d) => d.id === trip.driver_id) ?? null;
  const customerName = trip.customers?.name ?? "";
  const customerPhone = trip.customers?.phone ?? "";

  const tripText =
    `ABBA Car Rental - Trip\n` +
    `Date: ${niceDate(trip.trip_date)}\n` +
    `Time: ${niceTime(trip.trip_time)}\n` +
    `Pickup: ${trip.pickup}\n` +
    `Drop: ${trip.dropoff}\n` +
    `Passengers: ${trip.passengers}\n` +
    `Customer: ${customerName}, ${customerPhone}` +
    (trip.fare ? `\nFare: ₹${trip.fare}` : "") +
    (trip.notes ? `\nNotes: ${trip.notes}` : "");

  const customerText = driver
    ? `Hello ${customerName}, your ABBA Car Rental trip is confirmed.\n` +
      `Date: ${niceDate(trip.trip_date)}\n` +
      `Time: ${niceTime(trip.trip_time)}\n` +
      `Pickup: ${trip.pickup}\n` +
      `Driver: ${driver.name}, ${driver.phone}` +
      (driver.car_number ? `\nCar: ${driver.car_number}` : "") +
      `\nThank you!`
    : "";

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Trip</h1>
          <Link
            href="/trips"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Back
          </Link>
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="font-bold text-gray-900">
            {niceDate(trip.trip_date)} · {niceTime(trip.trip_time)}
          </p>
          <p className="text-gray-800">{trip.pickup} → {trip.dropoff}</p>
          <p className="text-sm text-gray-600">{customerName} · {customerPhone}</p>
          <p className="text-sm text-gray-600">
            Passengers: {trip.passengers}
            {trip.fare ? ` · ₹${trip.fare}` : ""}
          </p>
          {trip.notes && <p className="text-sm text-gray-600">Notes: {trip.notes}</p>}
        </div>

        {message && <p className="mb-4 text-sm text-red-600">{message}</p>}

        {driver && trip.status === "assigned" && (
          <div className="mb-4 rounded-lg bg-green-50 p-4">
            <p className="mb-3 font-semibold text-green-900">Assigned to {driver.name}</p>
            <a
              href={waLink(driver.phone, tripText)}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block rounded-lg bg-green-700 p-3 text-center font-bold text-white"
            >
              Send trip to driver on WhatsApp
            </a>
            <a
              href={waLink(customerPhone, customerText)}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-green-700 p-3 text-center font-bold text-white"
            >
              Send driver details to customer
            </a>
          </div>
        )}

              <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-3 font-bold text-gray-900">
            Status: {trip.status === "booked" ? "Not assigned" : trip.status === "no_show" ? "No-show" : trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </p>
          {trip.status === "booked" || trip.status === "assigned" ? (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setStatus("done")} disabled={saving} className="rounded-lg bg-gray-800 p-3 text-sm font-bold text-white">
                Done
              </button>
              <button onClick={() => setStatus("no_show")} disabled={saving} className="rounded-lg bg-gray-500 p-3 text-sm font-bold text-white">
                No-show
              </button>
              <button onClick={() => setStatus("cancelled")} disabled={saving} className="rounded-lg bg-red-600 p-3 text-sm font-bold text-white">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setStatus(trip.driver_id ? "assigned" : "booked")} disabled={saving} className="w-full rounded-lg border border-gray-300 p-3 text-sm font-bold text-gray-800">
              Reopen trip
            </button>
          )}
        </div> 

 <h2 className="mb-2 font-bold text-gray-900">
          {driver ? "Tap a car to change driver" : "Assign to"}
        </h2>
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => assign(d.id)}
                disabled={saving || d.id === trip.driver_id}
                className="w-full rounded-lg bg-white p-3 text-left shadow-sm disabled:opacity-50"
              >
                <p className="font-semibold text-gray-900">{d.name}</p>
                <p className="text-sm text-gray-600">
                  {d.car_number}
                  {d.is_own_car ? " · Own car" : " · Friend"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}