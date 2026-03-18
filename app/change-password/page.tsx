"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [current, setCurrent]       = useState("");
  const [next, setNext]             = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]     = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [forced, setForced]         = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("citizen");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    setEmail(user.email);
    setForced(!!user.mustChangePassword);
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to change password."); setLoading(false); return; }

    // Clear mustChangePassword flag from localStorage
    const stored = localStorage.getItem("citizen");
    if (stored) {
      const user = JSON.parse(stored);
      user.mustChangePassword = false;
      localStorage.setItem("citizen", JSON.stringify(user));
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] pr-10";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            {done ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Password Changed!</h2>
                <p className="text-sm text-gray-500">Redirecting to your dashboard…</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#003580] flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {forced ? "Set Your New Password" : "Change Password"}
                  </h1>
                  {forced && (
                    <p className="text-sm text-amber-600 font-medium mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                      You are using a temporary password. Please set a new password to continue.
                    </p>
                  )}
                </div>

                {error && (
                  <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={submit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                      {forced ? "Temporary Password" : "Current Password"}
                    </label>
                    <div className="relative">
                      <input
                        id="current" type={showCurrent ? "text" : "password"} required
                        className={inputClass} value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showCurrent ? "Hide password" : "Show password"}>
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="next" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        id="next" type={showNext ? "text" : "password"} required
                        className={inputClass} value={next}
                        onChange={(e) => setNext(e.target.value)}
                        placeholder="Minimum 8 characters"
                      />
                      <button type="button" onClick={() => setShowNext(!showNext)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showNext ? "Hide password" : "Show password"}>
                        {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength indicator */}
                    {next.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map((lvl) => (
                          <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                            next.length >= lvl * 3
                              ? lvl <= 1 ? "bg-red-400" : lvl <= 2 ? "bg-yellow-400" : lvl <= 3 ? "bg-blue-400" : "bg-green-500"
                              : "bg-gray-200"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      id="confirm" type="password" required
                      className={`${inputClass} ${confirm && confirm !== next ? "border-red-400" : ""}`}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                    {confirm && confirm !== next && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-[#003580] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Saving…" : "Change Password"}
                  </button>
                </form>

                {!forced && (
                  <button onClick={() => router.push("/dashboard")} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 text-center">
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
