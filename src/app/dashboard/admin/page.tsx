"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://unnayanai-backend.onrender.com";

export default function AdminDashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [users, setUsers] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== "admin") { window.location.href = `/dashboard/${parsed.role}`; return; }
    setUser(parsed);
    fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const roleCounts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥", color: "blue" },
    { label: "Farmers", value: roleCounts.farmer || 0, icon: "🌾", color: "emerald" },
    { label: "NGO Agents", value: roleCounts.ngo || 0, icon: "🏢", color: "cyan" },
    { label: "MFI Officers", value: roleCounts.mfi || 0, icon: "💳", color: "purple" },
    { label: "Investors", value: roleCounts.investor || 0, icon: "💰", color: "amber" },
    { label: "Pending NGOs", value: users.filter(u => u.role === "ngo" && u.status === "pending").length, icon: "⏳", color: "red" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <span className="text-white">⚙️</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">UnnayanAI Admin</p>
              <p className="text-xs text-red-500">Super Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">👤 {user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {["overview", "users", "system"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Users table */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">All Users ({users.length})</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Name", "Email", "Role", "District", "Status", "Joined"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === "farmer" ? "bg-emerald-100 text-emerald-700" :
                            u.role === "ngo" ? "bg-cyan-100 text-cyan-700" :
                            u.role === "mfi" ? "bg-blue-100 text-blue-700" :
                            u.role === "investor" ? "bg-purple-100 text-purple-700" :
                            "bg-red-100 text-red-700"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.district || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">{u.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No users yet. Share the signup link!</div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">System Status</h3>
              {[
                { name: "Frontend", status: "live", url: "unnayanai-for-livestocks.onrender.com" },
                { name: "Backend API", status: "live", url: "unnayanai-backend.onrender.com" },
                { name: "Database", status: "pending", url: "PostgreSQL — not connected" },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.url}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.status === "live" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.status === "live" ? "● Live" : "⚠ Pending"}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "View all users", icon: "👥", action: () => setTab("users") },
                  { label: "Go to main site", icon: "🌐", action: () => window.open("/", "_blank") },
                  { label: "View API docs", icon: "📖", action: () => window.open(`${API_URL}/docs`, "_blank") },
                ].map(a => (
                  <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left text-sm text-gray-700 transition-colors">
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
