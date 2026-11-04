"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Driver = {
  id: number;
  name: string;
  phone: string;
  car_number: string | null;
  car_model: string | null;
  is_own_car: boolean;
};

const inputClass = "mb-3 mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900";
const labelClass = "block text-sm font-medium text-gray-800";

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [isOwnCar, setIsOwnCar] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, phone, car_number, car_model, is_own_car")
      .eq("active", true)
      .order("is_own_car", { ascending: false })
      .order("name");
    if (error) {
      setMessage("Could not load drivers: " + error.message);
      return;
    }
    setDrivers((data ?? []) as Driver[]);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function clearForm() {
    setEditingId(null);
    setName("");
    setPhone("");
    setCarNumber("");
    setCarModel("");
    setIsOwnCar(false);
  }

  function startEdit(d: Driver) {
    setEditingId(d.id);
    setName(d.name);
    setPhone(d.phone);
    setCarNumber(d.car_number ?? "");
    setCarModel(d.car_model ?? "");
    setIsOwnCar(d.is_own_car);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const row = {
      name: name.trim(),
      phone: phone.trim(),
      car_number: carNumber.trim() || null,
      car_model: carModel.trim() || null,
      is_own_car: isOwnCar,
    };
    const { error } = editingId
      ? await supabase.from("drivers").update(row).eq("id", editingId)
      : await supabase.from("drivers").insert(row);
    setSaving(false);
    if (error) {
      setMessage("Could not save: " + error.message);
      return;
    }
    clearForm();
    load();
  }

  async function remove(d: Driver) {
    if (!window.confirm(`Remove ${d.name} from the list? Old trips stay saved.`)) return;
    const { error } = await supabase.from("drivers").update({ active: false }).eq("id", d.id);
    if (error) {
      setMessage("Could not remove: " + error.message);
      return;
    }
    if (editingId === d.id) clearForm();
    load();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Drivers</h1>
          <Link
            href="/trips"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Back
          </Link>
        </div>

        <form onSubmit={handleSave} className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold text-gray-900">
            {editingId ? "Edit driver" : "Add driver"}
          </h2>

          <label className={labelClass}>Name</label>
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

          <label className={labelClass}>Car number</label>
          <input
            placeholder="KL-07-AB-1234"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Car model (optional)</label>
          <input
            placeholder="Swift Dzire"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            className={inputClass}
          />

          <label className="mb-4 flex items-center gap-2 text-gray-800">
            <input
              type="checkbox"
              checked={isOwnCar}
              onChange={(e) => setIsOwnCar(e.target.checked)}
              className="h-5 w-5"
            />
            Own car (not a friend)
          </label>

          {message && <p className="mb-3 text-sm text-red-600">{message}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#F5B800] p-3 font-bold text-[#0F3D2E] disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add driver"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="rounded-lg border border-gray-300 px-4 text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.id} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="font-semibold text-gray-900">{d.name}</p>
              <p className="text-sm text-gray-600">
                {d.phone}
                {d.car_number ? ` · ${d.car_number}` : ""}
                {d.car_model ? ` · ${d.car_model}` : ""}
              </p>
              <p className="text-sm text-gray-600">{d.is_own_car ? "Own car" : "Friend"}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => startEdit(d)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(d)}
                  className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}