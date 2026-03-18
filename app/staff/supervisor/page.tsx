"use client";
import { useEffect, useState } from "react";
import { LogOut, BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { useStaffAuth } from "@/lib/useStaffAuth";

type Application = {
  id: string; firstName: string; lastName: string; idType: string;
  status: string; submittedAt: string; district: string;
};

const STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Ready for Collection"];
const DISTRICTS = ["Maseru", "Leribe", "Berea", "Mafeteng", "Mohale's Hoek", "Quthing", "Qacha's Nek", "Mokhotlong", "Thaba-Tseka", "Butha-Buthe"];

export default function SupervisorPage() {
  const { staff, ready, logout } = useStaffAuth("supervisor");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/applications").then((r) => r.json()).then((data) => { setApps(data); setLoading(false); });
  }, [ready]);

  if (!ready || !staff) return null;

  const total = apps.length;
  const approved = apps.filter((a) => a.status === "Approved").length;
  const rejected = apps.filter((a) => a.status === "Rejected").length;
  const pending = apps.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;

  const byDistrict = DISTRICTS.map((d) => ({
    district: d,
    count: apps.filter((a) => a.district === d).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

  const byType = ["New ID", "Replacement ID", "Renewal"].map((t) => ({
    type: t,
    count: apps.filter((a) => a.idType === t).length,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003580]">Supervisor Dashboard</h1>
              <p className="text-sm text-gray-500">{staff.name} · Reports & Analytics</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading reports…</div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Applications", value: total, icon: Users, color: "text-[#003580]", bg: "bg-blue-50" },
                  { label: "Pending / In Review", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                  { label: "Approved", value: approved, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Approval Rate", value: `${approvalRate}%`, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                    </div>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Status breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Applications by Status</h2>
                  <div className="space-y-3">
                    {STATUSES.map((s) => {
                      const count = apps.filter((a) => a.status === s).length;
                      const pct = total ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={s}>
                          <div className="flex items-center justify-between mb-1">
                            <StatusBadge status={s} />
                            <span className="text-sm font-semibold text-gray-700">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-2 bg-[#003580] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By ID type */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Applications by ID Type</h2>
                  <div className="space-y-3">
                    {byType.map(({ type, count }) => {
                      const pct = total ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{type}</span>
                            <span className="text-sm font-semibold text-gray-700">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-2 bg-[#009A44] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* By district */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                <h2 className="font-semibold text-gray-800 mb-4">Applications by District</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {byDistrict.map(({ district, count }) => (
                    <div key={district} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-[#003580]">{count}</p>
                      <p className="text-xs text-gray-500 mt-1">{district}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent applications */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Recent Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Applicant</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">District</th>
                        <th className="px-4 py-3 text-left">Submitted</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...apps].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 10).map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-[#003580] text-xs">{a.id}</td>
                          <td className="px-4 py-3 font-medium">{a.firstName} {a.lastName}</td>
                          <td className="px-4 py-3 text-gray-600">{a.idType}</td>
                          <td className="px-4 py-3 text-gray-600">{a.district}</td>
                          <td className="px-4 py-3 text-gray-600">{a.submittedAt}</td>
                          <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
