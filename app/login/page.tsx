"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Login failed."); setLoading(false); return; }
    localStorage.setItem("citizen", JSON.stringify(data));
    if (data.mustChangePassword) {
      router.push("/change-password");
    } else {
      router.push(params.get("next") ?? "/dashboard");
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[#003580] flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-xl font-bold">LS</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Citizen Login</h1>
        <p className="text-sm text-gray-500 mt-1">Access your ID application dashboard</p>
      </div>

      {params.get("next") && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
          Please sign in to continue with your ID application.
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input id="email" type="email" required autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#003580] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#003580] font-medium hover:underline">Create account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-center text-gray-400">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
