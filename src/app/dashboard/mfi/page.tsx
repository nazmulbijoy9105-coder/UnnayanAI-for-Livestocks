"use client";
import { useEffect, useState } from "react";

export default function MFIDashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href = "/login"; return; }
    setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  const assessments = [
    { farmer: "Rahim Mia", score: "82 (A)", risk: "Low", loan: "BDT 50,000", status: "Approved" },
    { farmer: "Karim Uddin", score: "61 (B)", risk: "Medium", loan: "BDT 25,000", status: "Review" },
    { farmer: "Fatema Begum", score: "74 (A)", risk: "Low", loan: "BDT 40,000", status: "Approved" },
    { farmer: "Jamal Hossain", score: "45 (C)", risk: "High", loan: "BDT 15,000", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white">💳</span>
            </div>
            <div>
              <p className="font-bold text-blue-700">UnnayanAI</p>
              <p className="text-xs text-blue-400">MFI Credit Officer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-blue-100 mt-1">{user.organization || "MFI Officer"} · Credit Assessment Portal</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending Reviews", value: "8", icon: "⏳" },
            { label: "Approved Today", value: "5", icon: "✅" },
            { label: "Avg Credit Score", value: "72", icon: "📊" },
            { label: "Total Portfolio", value: "BDT 4.2M", icon: "💰" },
          ].map(s => (
            <div key={s.label} className="bg-white/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-blue-600">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/70 border border-blue-100 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-blue-50">
            <h2 className="font-bold text-gray-800">Recent Credit Assessments</h2>
          </div>
          <table className="w-full">
            <thead className="bg-blue-50/50">
              <tr>{["Farmer", "AI Score", "Risk", "Loan Request", "Status"].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assessments.map((a, i) => (
                <tr key={i} className="hover:bg-blue-50/30">
                  <td className="px-6 py-4 font-medium text-gray-800">{a.farmer}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">{a.score}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.risk === "Low" ? "bg-green-100 text-green-700" : a.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{a.risk}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.loan}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.status === "Approved" ? "bg-green-100 text-green-700" : a.status === "Review" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
