"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Wrong email or password. Please try again.");
      return;
    }
    router.push("/trips");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0F3D2E] p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center bg-[url(/logo.svg)] bg-contain bg-no-repeat text-[0px] text-[#0F3D2E]">
          ABBA
        </div>
        <h1 className="text-center text-2xl font-bold text-[#0F3D2E]">ABBA Car Rental</h1>
        <p className="mb-6 text-center text-sm text-gray-600">Owner login</p>

        <label className="block text-sm font-medium text-gray-800">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        />

        <label className="block text-sm font-medium text-gray-800">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#F5B800] p-3 font-bold text-[#0F3D2E] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}