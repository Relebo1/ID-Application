"use client";
import { useEffect, useState } from "react";
import { LogOut, Search, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { useStaffAuth } from "@/lib/useStaffAuth";

type Application = {
  id: string; firstName: string; lastName: string; dob: string; gender: string;
  district: string; village: string; phone: string; email: string; idType: string;
  status: string; submittedAt: string; notes: string;
};

export default function SupportPage() {
  const { staff, ready, logout } = useStaffAuth("support");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/applications").then((r) => r.json()).then((data) => { setApps(data); setLoading(false); });
  }, [ready]);

  const filtered = apps.filter((a) =>
    `${a.firstName} ${a.lastName} ${a.id} ${a.email} ${a.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!ready || !staff) return null;

  const inputClass = "border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003580]">Help Desk</h1>
              <p className="text-sm text-gray-500">{staff.name} · Citizen Support</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
            </button>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 text-sm text-blue-800">
            <strong>Support Staff Access:</strong> You can view application details to assist citizens. You cannot modify application statuses.
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by name, reference, email, or phone…"
              className={`${inputClass} w-full pl-10`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search citizen applications"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No results found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Reference</th>
                      <th className="px-4 py-3 text-left">Applicant</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-[#003580] text-xs">{a.id}</td>
                        <td className="px-4 py-3 font-medium">{a.firstName} {a.lastName}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{a.email}</p>
                          <p className="text-xs text-gray-400">{a.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.idType}</td>
                        <td className="px-4 py-3 text-gray-600">{a.submittedAt}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelected(a)} className="flex items-center gap-1 text-xs font-medium text-[#003580] hover:underline">
                            <Eye className="w-3 h-3" aria-hidden="true" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="detail-title" className="text-lg font-bold text-gray-800">Application Details</h2>
              <button onClick={() => setSelected(null)} aria-label="Close" className="p-1 rounded hover:bg-gray-100 transition-colors">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm font-semibold text-[#003580]">{selected.id}</span>
              <StatusBadge status={selected.status} />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Full Name", `${selected.firstName} ${selected.lastName}`],
                ["Date of Birth", selected.dob],
                ["Gender", selected.gender],
                ["District", selected.district],
                ["Village", selected.village],
                ["Phone", selected.phone],
                ["Email", selected.email],
                ["ID Type", selected.idType],
                ["Submitted", selected.submittedAt],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded px-3 py-2">
                  <dt className="text-xs text-gray-400">{k}</dt>
                  <dd className="font-medium text-gray-800 text-xs mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
            {selected.notes && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                <strong>Officer Note:</strong> {selected.notes}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
