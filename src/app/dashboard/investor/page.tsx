"use client";
import { useEffect, useState } from "react";

export default function InvestorDashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("en");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href = "/login"; return; }
    setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  const sdgMetrics = [
    { sdg: "SDG 1", label: "No Poverty", icon: "🏚️", value: "+23%", desc: "Farmer income growth", progress: 77 },
    { sdg: "SDG 2", label: "Zero Hunger", icon: "🍽️", value: "+15%", desc: "Milk yield increase", progress: 60 },
    { sdg: "SDG 5", label: "Gender Equality", icon: "⚖️", value: "42%", desc: "Female farmers", progress: 84 },
    { sdg: "SDG 8", label: "Decent Work", icon: "💼", value: "2,340", desc: "Agent employment", progress: 47 },
    { sdg: "SDG 13", label: "Climate Action", icon: "🌍", value: "-18%", desc: "CO₂ reduced", progress: 72 },
    { sdg: "SDG 17", label: "Partnerships", icon: "🤝", value: "48", desc: "NGO partners", progress: 48 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white">💰</span>
            </div>
            <div>
              <p className="font-bold text-purple-700">UnnayanAI</p>
              <p className="text-xs text-purple-400">{lang === "en" ? "Investor & Donor Portal" : "বিনিয়োগকারী পোর্টাল"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-purple-50 border border-purple-200 text-purple-600 px-3 py-1.5 rounded-full">
              {lang === "en" ? "বাংলা" : "English"}
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{lang === "en" ? `Welcome, ${user.name}` : `স্বাগতম, ${user.name}`}</h1>
          <p className="text-purple-200 mt-1">{user.organization && `${user.organization} · `}{lang === "en" ? "Impact Dashboard" : "প্রভাব ড্যাশবোর্ড"}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-2xl font-bold">12,450</p>
              <p className="text-purple-200 text-sm">{lang === "en" ? "Farmers impacted" : "প্রভাবিত কৃষক"}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-2xl font-bold">BDT 45M</p>
              <p className="text-purple-200 text-sm">{lang === "en" ? "Loans disbursed" : "ঋণ বিতরণ"}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-2xl font-bold">6 SDGs</p>
              <p className="text-purple-200 text-sm">{lang === "en" ? "Goals tracked" : "লক্ষ্য ট্র্যাক"}</p>
            </div>
          </div>
        </div>

        {/* SDG Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{lang === "en" ? "SDG Impact Metrics" : "SDG প্রভাব মেট্রিক্স"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sdgMetrics.map(m => (
              <div key={m.sdg} className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl p-5 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-purple-600 font-bold text-sm">{m.sdg}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{m.value}</p>
                <p className="text-gray-500 text-sm mt-1">{m.desc}</p>
                <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${m.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment summary */}
        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{lang === "en" ? "Pricing & Investment Options" : "মূল্য ও বিনিয়োগ বিকল্প"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tier: lang === "en" ? "Farmer Access" : "কৃষক অ্যাক্সেস", price: "FREE", desc: lang === "en" ? "Forever, for all farmers" : "সকল কৃষকের জন্য বিনামূল্যে", color: "emerald" },
              { tier: lang === "en" ? "NGO District License" : "NGO জেলা লাইসেন্স", price: "BDT 300K-550K", desc: lang === "en" ? "Per year per district" : "প্রতি বছর প্রতি জেলা", color: "cyan" },
              { tier: lang === "en" ? "MFI Credit Advisory" : "MFI ক্রেডিট পরামর্শ", price: "BDT 200", desc: lang === "en" ? "Per loan assessment" : "প্রতি ঋণ মূল্যায়ন", color: "purple" },
              { tier: lang === "en" ? "IoT Premium Farm" : "IoT প্রিমিয়াম ফার্ম", price: "BDT 25K-50K+", desc: lang === "en" ? "Setup + BDT 2K/month" : "সেটআপ + ২হাজার/মাস", color: "amber" },
            ].map(t => (
              <div key={t.tier} className={`bg-${t.color}-50 border border-${t.color}-200 rounded-xl p-4`}>
                <p className={`text-${t.color}-700 font-medium text-sm`}>{t.tier}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{t.price}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
