"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [users, setUsers] = useState<Record<string, string>[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== "admin") { window.location.href = `/dashboard/${parsed.role}`; return; }
    setUser(parsed);

    Promise.all([
      fetch("/api/auth?action=users", { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch("/api/health").then(r => r.json()),
    ]).then(([usersData, healthData]) => {
      setUsers(Array.isArray(usersData) ? usersData : []);
      setHealth(healthData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const roleCounts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥" },
    { label: "Farmers", value: roleCounts.farmer || 0, icon: "🌾" },
    { label: "NGO Agents", value: roleCounts.ngo || 0, icon: "🏢" },
    { label: "MFI Officers", value: roleCounts.mfi || 0, icon: "💳" },
    { label: "Investors", value: roleCounts.investor || 0, icon: "💰" },
    { label: "Pending NGOs", value: users.filter(u => u.role === "ngo" && u.status === "pending").length, icon: "⏳" },
  ];

  const dbConnected = health?.database === "connected";
  const dbStats = health?.stats as Record<string, number> | undefined;

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
              <p className="text-2xl font-bold text-gray-800">{loading ? "..." : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {["overview", "users", "system"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-gray-700">Frontend</p>
                    <p className="text-xs text-gray-400">unnayan-ai-for-livestocks.vercel.app</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">● Live</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-gray-700">API Routes</p>
                    <p className="text-xs text-gray-400">Next.js API — /api/*</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">● Live</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-700">PostgreSQL Database</p>
                    <p className="text-xs text-gray-400">Render — singapore region</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${dbConnected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {dbConnected ? "● Connected" : "⚠ Checking..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Database Stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Users", value: dbStats?.total_users ?? "..." },
                  { label: "Milk Logs", value: dbStats?.total_milk_logs ?? "..." },
                  { label: "Cattle Registered", value: dbStats?.total_cattle ?? "..." },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600 text-sm">{s.label}</span>
                    <span className="font-bold text-gray-800">{loading ? "..." : s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button onClick={() => window.open("/api/health", "_blank")} className="text-xs text-blue-500 hover:underline">View full health report →</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "View all users", icon: "👥", action: () => setTab("users") },
                  { label: "Go to main site", icon: "🌐", action: () => window.open("/", "_blank") },
                  { label: "API health check", icon: "💓", action: () => window.open("/api/health", "_blank") },
                  { label: "Signup page", icon: "➕", action: () => window.open("/signup", "_blank") },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left text-sm text-gray-700 transition-colors">
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users table */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">All Users ({users.length})</h2>
              <button onClick={() => window.open("/signup", "_blank")} className="text-xs bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">+ Add User</button>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">👥</p>
                <p className="font-medium">No users yet</p>
                <p className="text-sm mt-1">Share the signup link to onboard farmers, NGOs and investors</p>
                <button onClick={() => window.open("/signup", "_blank")} className="mt-4 text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">Open Signup Page</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{["Name", "Email", "Role", "District", "Status", "Joined"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
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
                            "bg-red-100 text-red-700"}`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.district || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{u.status}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">{u.created_at?.slice(0,10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "system" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">API Endpoints</h3>
            <div className="space-y-2 font-mono text-sm">
              {[
                { method: "GET", path: "/api/health", desc: "Health check + DB stats" },
                { method: "POST", path: "/api/auth?action=signup", desc: "Register new user" },
                { method: "POST", path: "/api/auth?action=login", desc: "Login user" },
                { method: "GET", path: "/api/auth?action=me", desc: "Get current user" },
                { method: "GET", path: "/api/auth?action=users", desc: "List all users (admin)" },
                { method: "POST", path: "/api/milk", desc: "Log milk yield" },
                { method: "GET", path: "/api/milk", desc: "Get milk logs" },
                { method: "POST", path: "/api/cattle", desc: "Register cattle" },
                { method: "GET", path: "/api/cattle", desc: "List cattle" },
                { method: "GET", path: "/api/credit", desc: "Get credit score" },
              ].map(e => (
                <div key={e.path} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${e.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{e.method}</span>
                  <span className="text-gray-700">{e.path}</span>
                  <span className="text-gray-400 text-xs ml-auto">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
