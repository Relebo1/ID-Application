"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

type Application = {
  id: string; firstName: string; lastName: string; dob: string;
  gender: string; district: string; village: string; phone: string;
  email: string; idType: string; status: string; submittedAt: string; notes: string;
};

const STATUS_STEPS = ["Pending", "Under Review", "Approved", "Ready for Collection"];

function TrackContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("id") ?? "");
  const [app, setApp] = useState<Application | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const success = params.get("success") === "1";

  const search = async (id?: string) => {
    const searchId = id ?? query;
    if (!searchId.trim()) return;
    setLoading(true); setError(""); setApp(null);
    const res = await fetch(`/api/track?id=${encodeURIComponent(searchId.trim())}`);
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Not found.");
    else setApp(data);
    setLoading(false);
  };

  useEffect(() => {
    const id = params.get("id");
    if (id) search(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = app ? STATUS_STEPS.indexOf(app.status) : -1;

  return (
    <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003580] mb-2">Track Your Application</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your application reference number to check its status.</p>

        {success && (
          <div role="alert" className="mb-6 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            Application submitted successfully! Your reference number is <strong>{params.get("id")}</strong>. Save it to track your application.
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 mb-2">
            Application Reference Number
          </label>
          <div className="flex gap-3">
            <input
              id="trackId"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]"
              placeholder="e.g. LS-2025-0001"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button
              onClick={() => search()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003580] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {app && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                <p className="font-bold text-[#003580] text-lg">{app.id}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>

            {/* Progress bar */}
            {app.status !== "Rejected" && (
              <div aria-label="Application progress">
                <div className="flex justify-between mb-2">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        i <= stepIndex ? "bg-[#009A44] border-[#009A44] text-white" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {i <= stepIndex ? "✓" : i + 1}
                      </div>
                      <span className="text-xs text-center mt-1 text-gray-500 hidden sm:block">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-1.5 bg-[#009A44] rounded-full transition-all"
                    style={{ width: `${stepIndex >= 0 ? ((stepIndex) / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Full Name</dt><dd className="font-semibold">{app.firstName} {app.lastName}</dd></div>
              <div><dt className="text-gray-500">ID Type</dt><dd className="font-semibold">{app.idType}</dd></div>
              <div><dt className="text-gray-500">District</dt><dd className="font-semibold">{app.district}</dd></div>
              <div><dt className="text-gray-500">Submitted</dt><dd className="font-semibold">{app.submittedAt}</dd></div>
            </dl>

            {app.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                <strong>Note from Home Affairs:</strong> {app.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>}>
        <TrackContent />
      </Suspense>
      <Footer />
    </div>
  );
}
