"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function FarmerDashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("en");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href = "/login"; return; }
    setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  const stats = [
    { label: lang === "en" ? "My Cattle" : "আমার গরু", value: "6", icon: "🐄", color: "emerald" },
    { label: lang === "en" ? "Today's Milk" : "আজকের দুধ", value: "42 L", icon: "🥛", color: "cyan" },
    { label: lang === "en" ? "Credit Score" : "ক্রেডিট স্কোর", value: "78 (A)", icon: "💳", color: "green" },
    { label: lang === "en" ? "AI Alerts" : "AI সতর্কতা", value: "2", icon: "🔔", color: "amber" },
  ];

  const alerts = [
    { type: "health", msg: lang === "en" ? "Cow #3 showing low milk yield — possible mastitis" : "গরু #৩ এর দুধ কম — মাস্টাইটিস সম্ভব", level: "warning" },
    { type: "fertility", msg: lang === "en" ? "Cow #1 heat detection: breed within 12 hours" : "গরু #১ হিট সনাক্ত: ১২ ঘন্টার মধ্যে প্রজনন করুন", level: "info" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-lg">🌾</span>
            </div>
            <div>
              <p className="font-bold text-emerald-700">{lang === "en" ? "UnnayanAI" : "উন্নয়নAI"}</p>
              <p className="text-xs text-emerald-500">{lang === "en" ? "Farmer Portal" : "কৃষক পোর্টাল"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-full">
              {lang === "en" ? "বাংলা" : "English"}
            </button>
            <span className="text-sm text-gray-600">👋 {user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">
              {lang === "en" ? "Logout" : "লগআউট"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">{lang === "en" ? `Welcome, ${user.name}!` : `স্বাগতম, ${user.name}!`}</h1>
          <p className="text-emerald-100 mt-1">{lang === "en" ? `District: ${user.district || "Not set"}` : `জেলা: ${user.district || "সেট করা হয়নি"}`}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 shadow-sm">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-emerald-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">{lang === "en" ? "AI Alerts" : "AI সতর্কতা"}</h2>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`p-4 rounded-xl border ${a.level === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                {a.msg}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🥛", label: lang === "en" ? "Log Milk" : "দুধ লগ করুন", href: "#" },
            { icon: "💊", label: lang === "en" ? "Health Log" : "স্বাস্থ্য লগ", href: "#" },
            { icon: "📅", label: lang === "en" ? "Fertility Calendar" : "প্রজনন ক্যালেন্ডার", href: "#" },
            { icon: "📊", label: lang === "en" ? "My Reports" : "আমার রিপোর্ট", href: "#" },
          ].map(a => (
            <Link key={a.label} href={a.href} className="bg-white/70 border border-emerald-100 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-sm font-medium text-gray-700">{a.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
