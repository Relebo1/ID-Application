"use client";
import { useEffect, useState } from "react";
import { LogOut, Pencil, X, FileText, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { useStaffAuth } from "@/lib/useStaffAuth";

type Document = { name: string; type: string; uploadedAt: string };
type Application = {
  id: string; firstName: string; lastName: string; dob: string; gender: string;
  district: string; village: string; phone: string; email: string; idType: string;
  status: string; submittedAt: string; notes: string; documents: Document[];
};

const STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Ready for Collection"];

export default function OfficerDashboard() {
  const { staff, ready, logout } = useStaffAuth("officer");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!ready) return;
    fetch("/api/applications").then((r) => r.json()).then((data) => { setApps(data); setLoading(false); });
  }, [ready]);

  const openModal = (app: Application) => { setSelected(app); setNewStatus(app.status); setNotes(app.notes); };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/applications/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, notes }),
    });
    const updated = await res.json();
    setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSaving(false); setSelected(null);
  };

  const filtered = apps.filter((a) => {
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchSearch = `${a.firstName} ${a.lastName} ${a.id}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (!ready || !staff) return null;

  const inputClass = "border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003580]">Officer Dashboard</h1>
              <p className="text-sm text-gray-500">{staff.name} · {staff.district} District</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
                className={`bg-white rounded-xl border p-4 text-center shadow-sm hover:shadow-md transition-all ${filterStatus === s ? "border-[#003580] ring-2 ring-[#003580]" : "border-gray-200"}`}>
                <p className="text-2xl font-bold text-[#003580]">{apps.filter((a) => a.status === s).length}</p>
                <p className="text-xs text-gray-500 mt-1">{s}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input type="search" placeholder="Search by name or reference…" className={`${inputClass} w-full pl-10`} value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applications" />
            </div>
            <select className={inputClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Reference</th>
                      <th className="px-4 py-3 text-left">Applicant</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">District</th>
                      <th className="px-4 py-3 text-left">Docs</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-[#003580] text-xs">{a.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{a.firstName} {a.lastName}</p>
                          <p className="text-xs text-gray-400">{a.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.idType}</td>
                        <td className="px-4 py-3 text-gray-600">{a.district}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText className="w-3 h-3" aria-hidden="true" /> {a.documents?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.submittedAt}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => openModal(a)} className="flex items-center gap-1 text-xs font-medium text-[#003580] hover:underline">
                            <Pencil className="w-3 h-3" aria-hidden="true" /> Review
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

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-lg font-bold text-gray-800">Review Application</h2>
              <button onClick={() => setSelected(null)} aria-label="Close" className="p-1 rounded hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Applicant details */}
            <dl className="grid grid-cols-2 gap-2 text-sm mb-4">
              {[
                ["Reference", selected.id], ["Name", `${selected.firstName} ${selected.lastName}`],
                ["DOB", selected.dob], ["Gender", selected.gender],
                ["District", selected.district], ["Village", selected.village],
                ["Phone", selected.phone], ["Email", selected.email],
                ["ID Type", selected.idType], ["Submitted", selected.submittedAt],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded px-3 py-2">
                  <dt className="text-xs text-gray-400">{k}</dt>
                  <dd className="font-medium text-gray-800 text-xs mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Documents */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents ({selected.documents?.length ?? 0})</p>
              {selected.documents?.length ? (
                <ul className="space-y-1">
                  {selected.documents.map((d) => (
                    <li key={d.type} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                      <FileText className="w-4 h-4 text-[#003580]" aria-hidden="true" />
                      <span>{d.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{d.uploadedAt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No documents uploaded.</p>
              )}
            </div>

            {/* Update status */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select id="statusSelect" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="notesInput" className="block text-sm font-medium text-gray-700 mb-1">Notes for Citizen</label>
                <textarea id="notesInput" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional message to the applicant…" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#003580] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60">
                {saving ? "Saving…" : "Save & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
