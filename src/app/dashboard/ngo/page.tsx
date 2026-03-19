"use client";
import { useEffect, useState } from "react";

export default function NGODashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href = "/login"; return; }
    setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  if (user.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl border border-amber-100">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Account Pending Approval</h2>
          <p className="text-gray-500 text-sm">Your NGO account is under review. Admin will activate it within 24 hours.</p>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="mt-6 text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "My Farmers", value: "234", icon: "👨‍🌾" },
    { label: "Districts", value: "3", icon: "📍" },
    { label: "Active Alerts", value: "12", icon: "🔔" },
    { label: "This Month Visits", value: "45", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <span className="text-white">🏢</span>
            </div>
            <div>
              <p className="font-bold text-cyan-700">UnnayanAI</p>
              <p className="text-xs text-cyan-400">NGO / Field Agent Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-cyan-100 mt-1">{user.organization || "Field Agent"} · {user.district || "All Districts"}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white/70 border border-cyan-100 rounded-2xl p-5 shadow-sm">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-cyan-600">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Register Farmer", "Log Farm Visit", "Submit Report", "View My Cluster"].map(a => (
              <button key={a} className="p-4 rounded-xl border border-cyan-200 text-cyan-700 text-sm font-medium hover:bg-cyan-50 transition-colors">{a}</button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
