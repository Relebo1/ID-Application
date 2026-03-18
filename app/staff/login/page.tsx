"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ROLE_ROUTES: Record<string, string> = {
  officer: "/staff/dashboard",
  supervisor: "/staff/supervisor",
  admin: "/staff/admin",
  support: "/staff/support",
};

const DEMO_ACCOUNTS = [
  { role: "Officer", email: "officer@homeaffairs.ls", password: "officer123" },
  { role: "Supervisor", email: "supervisor@homeaffairs.ls", password: "super123" },
  { role: "Admin", email: "admin@homeaffairs.ls", password: "admin123" },
  { role: "Support", email: "support@homeaffairs.ls", password: "support123" },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Login failed."); setLoading(false); return; }
    localStorage.setItem("staff", JSON.stringify(data));
    router.push(ROLE_ROUTES[data.role] ?? "/staff/dashboard");
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#003580] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Staff Portal Login</h1>
              <p className="text-sm text-gray-500 mt-1">Home Affairs — Authorised Personnel Only</p>
            </div>

            {error && (
              <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                <input id="email" type="email" required autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@homeaffairs.ls" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input id="password" type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#003580] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Demo accounts:</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(({ role, email: e, password: p }) => (
                  <button
                    key={role}
                    onClick={() => { setEmail(e); setPassword(p); }}
                    className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-[#003580] hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-xs font-semibold text-[#003580]">{role}</p>
                    <p className="text-xs text-gray-400 truncate">{e}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
