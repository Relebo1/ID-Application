"use client";
import { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, ExternalLink, Copy, CheckCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type SignupResult = {
  message: string;
  previewUrl?: string;
  tempPassword?: string;
};

export default function SignupPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<SignupResult | null>(null);
  const [copied, setCopied]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
    const data = res.headers.get("content-type")?.includes("application/json") ? await res.json() : {};
    if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }
    setResult(data);
    setLoading(false);
  };

  const copyPassword = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          {!result ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#003580] flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">Create Your Account</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Register to apply for your Lesotho National ID
                </p>
              </div>

              {error && (
                <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={submit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name" type="text" required autoComplete="name"
                    className={inputClass} value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thabo Mokoena"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email" type="email" required autoComplete="email"
                    className={inputClass} value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                  A temporary password will be sent to your email address. You will be required to change it on first login.
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#003580] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-[#003580] font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          ) : (
            /* Success screen */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Account Created!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your credentials have been sent to <strong>{email}</strong>.
              </p>

              {/* Dev-only: show temp password inline */}
              {result.tempPassword && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-left">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Temporary Password</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-[#003580] tracking-widest">{result.tempPassword}</span>
                    <button
                      onClick={copyPassword}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#003580] transition-colors"
                      aria-label="Copy password"
                    >
                      {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-red-500 mt-2 font-medium">You must change this password after first login.</p>
                </div>
              )}

              {/* Dev-only: Ethereal email preview link */}
              {result.previewUrl && (
                <a
                  href={result.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-[#003580] hover:underline mb-6"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  Preview email (development only)
                </a>
              )}

              <Link
                href="/login"
                className="block w-full bg-[#003580] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors text-center"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
