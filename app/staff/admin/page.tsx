"use client";
import { useEffect, useState } from "react";
import { LogOut, UserPlus, Shield, Users, Settings, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/lib/useStaffAuth";

type StaffEntry = { id: string; name: string; email: string; role: string; district: string };

const ROLE_COLORS: Record<string, string> = {
  officer:    "bg-blue-100 text-blue-800",
  supervisor: "bg-purple-100 text-purple-800",
  admin:      "bg-red-100 text-red-800",
  support:    "bg-green-100 text-green-800",
};

const DISTRICTS = ["All","Maseru","Leribe","Berea","Mafeteng","Mohale's Hoek","Quthing","Qacha's Nek","Mokhotlong","Thaba-Tseka","Butha-Buthe"];

export default function AdminPage() {
  const { staff, ready, logout } = useStaffAuth("admin");
  const [users, setUsers]       = useState<StaffEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", email: "", role: "officer", district: "Maseru", password: "" });
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/staff/users").then((r) => r.json()).then((data) => { setUsers(data); setLoading(false); });
  }, [ready]);

  const addUser = async () => {
    if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/staff/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to create user."); setSaving(false); return; }
    setUsers((prev) => [...prev, data]);
    setForm({ name: "", email: "", role: "officer", district: "Maseru", password: "" });
    setShowForm(false); setSaving(false);
  };

  const removeUser = async (id: string) => {
    await fetch("/api/staff/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (!ready || !staff) return null;

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003580]">System Administration</h1>
              <p className="text-sm text-gray-500">{staff.name} · User & System Management</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Staff Users",  value: users.length,                                    icon: Users,    color: "text-[#003580]",  bg: "bg-blue-50"   },
              { label: "Officers",           value: users.filter((u) => u.role === "officer").length, icon: Shield,   color: "text-blue-600",   bg: "bg-blue-50"   },
              { label: "System Modules",     value: 6,                                               icon: Settings, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "System Status",      value: "Online",                                        icon: Activity, color: "text-green-600",  bg: "bg-green-50"  },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* User management table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Staff User Accounts</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#003580] text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors">
                <UserPlus className="w-4 h-4" aria-hidden="true" /> Add User
              </button>
            </div>

            {showForm && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">New Staff Account</h3>
                {error && <p role="alert" className="text-red-600 text-sm mb-3">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Work Email *</label>
                    <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@homeaffairs.ls" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                    <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                      <option value="officer">Registration Officer</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">System Administrator</option>
                      <option value="support">Support Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                    <select className={inputClass} value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}>
                      {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password *</label>
                    <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Temporary password" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={addUser} disabled={saving} className="px-5 py-2 bg-[#009A44] text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
                    {saving ? "Creating…" : "Create Account"}
                  </button>
                  <button onClick={() => { setShowForm(false); setError(""); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading users…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">District</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.district}</td>
                        <td className="px-4 py-3">
                          {u.id !== staff.id && (
                            <button onClick={() => removeUser(u.id)} className="text-xs text-red-500 hover:underline font-medium">
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System modules */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">System Modules</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Citizen Registration","Application Processing","Document Management","Notification Service","Reporting & Analytics","Access Control"].map((name) => (
                <div key={name} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
