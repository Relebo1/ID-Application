"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LogOut, Bell, BellOff, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

type Application = {
  id: string; firstName: string; lastName: string; idType: string;
  status: string; submittedAt: string; district: string;
};

type Notification = {
  id: string; message: string; channel: string; read: boolean; createdAt: string;
};

type Citizen = { name: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"applications" | "notifications">("applications");

  useEffect(() => {
    const stored = localStorage.getItem("citizen");
    if (!stored) { router.push("/login"); return; }
    const user: Citizen = JSON.parse(stored);
    setCitizen(user);
    Promise.all([
      fetch(`/api/applications?email=${encodeURIComponent(user.email)}`).then((r) => r.json()),
      fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`).then((r) => r.json()),
    ]).then(([appsData, notifData]) => {
      setApps(appsData);
      setNotifications(notifData);
      setLoading(false);
    });
  }, [router]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const logout = () => {
    localStorage.removeItem("citizen");
    router.push("/login");
  };

  const unread = notifications.filter((n) => !n.read).length;

  if (!citizen) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#003580]">Welcome, {citizen.name}</h1>
              <p className="text-sm text-gray-500">{citizen.email}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/register" className="flex items-center gap-2 px-4 py-2 bg-[#009A44] text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" aria-hidden="true" /> New Application
              </Link>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: apps.length, color: "text-[#003580]" },
              { label: "Pending", value: apps.filter((a) => a.status === "Pending").length, color: "text-yellow-600" },
              { label: "Approved", value: apps.filter((a) => a.status === "Approved").length, color: "text-green-600" },
              { label: "Ready", value: apps.filter((a) => a.status === "Ready for Collection").length, color: "text-purple-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "applications" ? "border-[#003580] text-[#003580]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "notifications" ? "border-[#003580] text-[#003580]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              Notifications
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>
          </div>

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading applications…</div>
              ) : apps.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No applications yet.{" "}
                  <Link href="/register" className="text-[#003580] font-medium hover:underline">Apply now</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">Reference</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">District</th>
                        <th className="px-6 py-3 text-left">Submitted</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {apps.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-[#003580] text-xs">{a.id}</td>
                          <td className="px-6 py-4">{a.firstName} {a.lastName}</td>
                          <td className="px-6 py-4">{a.idType}</td>
                          <td className="px-6 py-4">{a.district}</td>
                          <td className="px-6 py-4">{a.submittedAt}</td>
                          <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                          <td className="px-6 py-4">
                            <Link href={`/track?id=${a.id}`} className="flex items-center gap-1 text-[#003580] hover:underline text-xs font-medium">
                              <ExternalLink className="w-3 h-3" aria-hidden="true" /> Track
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-2 text-gray-400 text-sm">
                  <BellOff className="w-8 h-8" aria-hidden="true" />
                  No notifications yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <li key={n.id} className={`px-6 py-4 flex items-start gap-4 ${n.read ? "bg-white" : "bg-blue-50"}`}>
                      <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${n.read ? "text-gray-300" : "text-[#003580]"}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.createdAt} · via {n.channel}</p>
                      </div>
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="text-xs text-[#003580] hover:underline flex-shrink-0 font-medium">
                          Mark read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
