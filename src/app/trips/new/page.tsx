"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const inputClass = "mb-4 mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900";
const labelClass = "block text-sm font-medium text-gray-800";

export default function NewTripPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-CA");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [fare, setFare] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert({ name: name.trim(), phone: phone.trim() }, { onConflict: "phone" })
      .select("id")
      .single();

    if (customerError || !customer) {
      setError("Could not save customer: " + (customerError?.message ?? "unknown error"));
      setSaving(false);
      return;
    }

    const { error: tripError } = await supabase.from("trips").insert({
      customer_id: customer.id,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      trip_date: date,
      trip_time: time,
      passengers: Number(passengers) || 1,
      fare: fare ? Number(fare) : null,
      notes: notes.trim() || null,
      booked_via: "phone",
    });

    if (tripError) {
      setError("Could not save trip: " + tripError.message);
      setSaving(false);
      return;
    }

    router.push("/trips");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Add trip</h1>
          <Link
            href="/trips"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSave} className="rounded-lg bg-white p-4 shadow-sm">
          <label className={labelClass}>Customer name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            required
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Pickup</label>
          <input required value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputClass} />

          <label className={labelClass}>Drop</label>
          <input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} className={inputClass} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Passengers</label>
              <input type="number" min="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fare ₹ (optional)</label>
              <input type="number" min="0" value={fare} onChange={(e) => setFare(e.target.value)} className={inputClass} />
            </div>
          </div>

          <label className={labelClass}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#F5B800] p-3 font-bold text-[#0F3D2E] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save trip"}
          </button>
        </form>
      </div>
    </main>
  );
}