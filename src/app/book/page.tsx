"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

// Hari's WhatsApp number: country code + number, digits only. Change when Hari confirms.
const ABBA_WHATSAPP = "910000000000";

const inputClass = "mb-4 mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900";
const labelClass = "block text-sm font-medium text-gray-800";

function niceTime(time: string) {
  return new Date("2000-01-01T" + time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function niceDate(date: string) {
  return new Date(date + "T00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function BookPage() {
  const today = new Date().toLocaleDateString("en-CA");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [booked, setBooked] = useState(false);

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error } = await supabase.rpc("book_trip", {
      p_name: name,
      p_phone: phone,
      p_pickup: pickup,
      p_dropoff: dropoff,
      p_date: date,
      p_time: time,
      p_passengers: Number(passengers) || 1,
      p_notes: notes || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message || "Could not book. Please call us.");
      return;
    }
    setBooked(true);
  }

  if (booked) {
    const text =
      `New booking - ABBA Car Rental\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Pickup: ${pickup}\n` +
      `Drop: ${dropoff}\n` +
      `Date: ${niceDate(date)}\n` +
      `Time: ${niceTime(time)}\n` +
      `Passengers: ${passengers}` +
      (notes ? `\nNotes: ${notes}` : "");

    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0F3D2E] p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5B800] text-xl font-black text-[#0F3D2E]">
            ABBA
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#0F3D2E]">Booking received!</h1>
          <p className="mb-6 text-gray-700">
            Thank you, {name}. We will send you your driver details soon.
          </p>
          <a
            href={`https://wa.me/${ABBA_WHATSAPP}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 block rounded-lg bg-green-700 p-3 font-bold text-white"
          >
            Send booking on WhatsApp
          </a>
          <p className="text-sm text-gray-600">This helps us confirm your trip faster.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F3D2E] p-4">
      <form onSubmit={handleBook} className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5B800] text-xl font-black text-[#0F3D2E]">
          ABBA
        </div>
        <h1 className="text-center text-2xl font-bold text-[#0F3D2E]">Book a taxi</h1>
        <p className="mb-6 text-center text-sm text-gray-600">ABBA Car Rental</p>

        <label className={labelClass}>Your name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

        <label className={labelClass}>Phone (WhatsApp)</label>
        <input
          type="tel"
          required
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />

        <label className={labelClass}>Pickup place</label>
        <input required value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputClass} />

        <label className={labelClass}>Drop place</label>
        <input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} className={inputClass} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" required min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        <label className={labelClass}>Passengers</label>
        <input type="number" min="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass} />

        <label className={labelClass}>Notes (optional)</label>
        <textarea
          placeholder="Luggage, return trip, landmark..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
          rows={2}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[#F5B800] p-3 font-bold text-[#0F3D2E] disabled:opacity-60"
        >
          {saving ? "Booking..." : "Book now"}
        </button>
      </form>
    </main>
  );
}