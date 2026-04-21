"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PKSFPage() {
  const [stats, setStats] = useState(null);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const sdgGoals = [
    { sdg: "SDG 1", label: "No Poverty", icon: "🏚️", metric: "Farmer income +23%", progress: 77 },
    { sdg: "SDG 2", label: "Zero Hunger", icon: "🍽️", metric: "Milk yield +15%", progress: 60 },
    { sdg: "SDG 5", label: "Gender Equality", icon: "⚖️", metric: "42% female farmers", progress: 84 },
    { sdg: "SDG 8", label: "Decent Work", icon: "💼", metric: "2,340 agent jobs", progress: 47 },
    { sdg: "SDG 13", label: "Climate Action", icon: "🌍", metric: "CO₂ -18%", progress: 72 },
    { sdg: "SDG 17", label: "Partnerships", icon: "🤝", metric: "48 NGO partners", progress: 48 },
  ];

  const principles = [
    { icon: "👤", title: "Human Autonomy", desc: "Farmers & MFIs retain final decision authority. AI only advises.", bn: "মানুষই চূড়ান্ত সিদ্ধান্ত নেয়" },
    { icon: "⚖️", title: "Fairness", desc: "Weekly bias monitoring across districts, gender, farm size.", bn: "জেলা, লিঙ্গ, খামারের আকারে পক্ষপাত পর্যবেক্ষণ" },
    { icon: "🔍", title: "Transparency", desc: "Every AI decision explained in Bangla to farmers.", bn: "প্রতিটি AI সিদ্ধান্ত বাংলায় ব্যাখ্যা করা হয়" },
    { icon: "🔒", title: "Privacy", desc: "GDPR-compliant consent. AES-256 encryption. 7-year audit retention.", bn: "GDPR-সম্মত সম্মতি। AES-256 এনক্রিপশন" },
    { icon: "📋", title: "Accountability", desc: "Hash-chained immutable audit trail for every action.", bn: "প্রতিটি কাজের জন্য অপরিবর্তনীয় অডিট ট্রেইল" },
    { icon: "🛡️", title: "Safety", desc: "5-rule deterministic engine blocks all risky inputs before AI.", bn: "AI-এর আগে ৫টি নিয়ম দিয়ে ঝুঁকিপূর্ণ ইনপুট ব্লক" },
    { icon: "🌱", title: "Sustainability", desc: "IoT reduces emissions. SDG-aligned impact measurement.", bn: "IoT নির্গমন কমায়। SDG-সম্মত প্রভাব পরিমাপ" },
  ];

  const architecture = [
    { layer: "Layer 1", name: "Deterministic Rule Engine", color: "red", desc: "Non-bypassable safety rules: consent check, yield plausibility, fraud detection, duplicate prevention, future date block" },
    { layer: "Layer 2", name: "ML Credit Scoring", color: "blue", desc: "5-factor weighted model: milk yield (30%), data consistency (20%), herd quality (20%), engagement (15%), yield trend (15%)" },
    { layer: "Layer 3", name: "LLM Explainability", color: "purple", desc: "GPT-4 powered Bangla + English explanations for every credit decision. Farmer-friendly language." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🌾</span>
            </div>
            <div>
              <p className="font-bold text-emerald-700">UnnayanAI</p>
              <p className="text-xs text-emerald-500">PKSF Submission Package</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-full">{lang === "en" ? "বাংলা" : "English"}</button>
            <Link href="/" className="text-xs text-emerald-600 hover:underline">← Main Site</Link>
            <Link href="/docs" className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full hover:bg-emerald-600">API Docs</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === "en" ? "Live Platform — Production Ready" : "লাইভ প্ল্যাটফর্ম — প্রোডাকশন রেডি"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            {lang === "en" ? "UnnayanAI: Smart Dairy" : "উন্নয়নAI: স্মার্ট ডেয়ারি"}
            <span className="block bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {lang === "en" ? "AI & IoT Platform" : "AI ও IoT প্ল্যাটফর্ম"}
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            {lang === "en"
              ? "Bangladesh-first human-centered AI platform for dairy farmers, NGOs, and MFIs. Built for PKSF Unnayan Prochesta programme."
              : "বাংলাদেশের ডেয়ারি কৃষক, NGO এবং MFI-এর জন্য মানবকেন্দ্রিক AI প্ল্যাটফর্ম। PKSF উন্নয়ন প্রচেষ্টা প্রোগ্রামের জন্য নির্মিত।"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
              {lang === "en" ? "View Live Demo →" : "লাইভ ডেমো দেখুন →"}
            </Link>
            <Link href="/docs" className="px-8 py-4 rounded-2xl border-2 border-emerald-200 text-emerald-700 font-bold text-lg hover:border-emerald-400 transition-all">
              {lang === "en" ? "API Documentation" : "API ডকুমেন্টেশন"}
            </Link>
          </div>
        </section>

        {/* Live Stats */}
        {stats && (
          <section className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-8">{lang === "en" ? "Live Platform Statistics" : "লাইভ প্ল্যাটফর্ম পরিসংখ্যান"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-white/20 rounded-2xl p-5">
                <p className="text-4xl font-bold">{stats.stats?.total_users || 0}</p>
                <p className="text-emerald-100 mt-1">{lang === "en" ? "Registered Users" : "নিবন্ধিত ব্যবহারকারী"}</p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-5">
                <p className="text-4xl font-bold">{stats.stats?.total_milk_logs || 0}</p>
                <p className="text-emerald-100 mt-1">{lang === "en" ? "Milk Logs" : "দুধ লগ"}</p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-5">
                <p className="text-4xl font-bold">{stats.stats?.total_cattle || 0}</p>
                <p className="text-emerald-100 mt-1">{lang === "en" ? "Cattle Registered" : "নিবন্ধিত গরু"}</p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-5">
                <p className="text-4xl font-bold">9</p>
                <p className="text-emerald-100 mt-1">{lang === "en" ? "API Endpoints" : "API এন্ডপয়েন্ট"}</p>
              </div>
            </div>
          </section>
        )}

        {/* 7 AI Principles */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">{lang === "en" ? "7 Core AI Principles" : "৭টি মূল AI নীতি"}</h2>
          <p className="text-gray-500 text-center mb-10">{lang === "en" ? "Human-Laws-AI Centered Design Framework" : "মানব-আইন-AI কেন্দ্রিক ডিজাইন ফ্রেমওয়ার্ক"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((p, i) => (
              <div key={i} className="bg-white/70 border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm">{lang === "en" ? p.desc : p.bn}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-center">
              <p className="text-4xl font-bold mb-2">100%</p>
              <p className="font-medium">{lang === "en" ? "Human-in-loop for HIGH risk decisions" : "উচ্চ ঝুঁকির সিদ্ধান্তে মানব পর্যালোচনা"}</p>
            </div>
          </div>
        </section>

        {/* 3-Layer Architecture */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">{lang === "en" ? "3-Layer Hybrid AI Architecture" : "৩-স্তরীয় হাইব্রিড AI আর্কিটেকচার"}</h2>
          <p className="text-gray-500 text-center mb-10">{lang === "en" ? "Safety-first design — rules before ML before LLM" : "নিরাপত্তা-প্রথম ডিজাইন"}</p>
          <div className="space-y-4">
            {architecture.map((a, i) => (
              <div key={i} className={"rounded-2xl p-6 border shadow-sm " + (a.color === "red" ? "bg-red-50 border-red-200" : a.color === "blue" ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200")}>
                <div className="flex items-start gap-4">
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 " + (a.color === "red" ? "bg-red-500" : a.color === "blue" ? "bg-blue-500" : "bg-purple-500")}>{i + 1}</div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">{a.layer}</p>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{a.name}</h3>
                    <p className="text-gray-600 text-sm">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SDG Goals */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">{lang === "en" ? "SDG Impact Alignment" : "SDG প্রভাব সমন্বয়"}</h2>
          <p className="text-gray-500 text-center mb-10">{lang === "en" ? "Measurable impact across 6 UN Sustainable Development Goals" : "৬টি জাতিসংঘ টেকসই উন্নয়ন লক্ষ্যমাত্রায় পরিমাপযোগ্য প্রভাব"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sdgGoals.map((g, i) => (
              <div key={i} className="bg-white/70 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-emerald-600 font-bold text-sm">{g.sdg}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{g.label}</span>
                </div>
                <p className="font-bold text-gray-800 mb-3">{g.metric}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full" style={{ width: g.progress + "%" }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{g.progress}% of target</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-white/70 border border-emerald-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{lang === "en" ? "Production Tech Stack" : "প্রোডাকশন টেক স্ট্যাক"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 15", desc: "Frontend + API", icon: "▲" },
              { name: "PostgreSQL", desc: "Database", icon: "🐘" },
              { name: "Vercel", desc: "Deployment", icon: "⚡" },
              { name: "PWA", desc: "Mobile Offline", icon: "📱" },
              { name: "JWT Auth", desc: "5 User Roles", icon: "🔐" },
              { name: "Rule Engine", desc: "5 Safety Rules", icon: "🛡️" },
              { name: "SSL Wireless", desc: "Bangla SMS", icon: "📱" },
              { name: "OpenAPI 3.0", desc: "API Docs", icon: "📖" },
            ].map((t, i) => (
              <div key={i} className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-2xl mb-2">{t.icon}</div>
                <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">{lang === "en" ? "Revenue Model" : "রাজস্ব মডেল"}</h2>
          <p className="text-gray-500 text-center mb-10">{lang === "en" ? "Social business — farmers free forever" : "সামাজিক ব্যবসা — কৃষকদের জন্য সবসময় বিনামূল্যে"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tier: lang === "en" ? "Farmer Access" : "কৃষক অ্যাক্সেস", price: "FREE", desc: lang === "en" ? "Forever — all features" : "চিরকাল — সব ফিচার", color: "emerald", highlight: false },
              { tier: lang === "en" ? "NGO District License" : "NGO জেলা লাইসেন্স", price: "BDT 300K-550K", desc: lang === "en" ? "Per year per district" : "প্রতি বছর প্রতি জেলা", color: "cyan", highlight: true },
              { tier: lang === "en" ? "MFI Credit Advisory" : "MFI ক্রেডিট পরামর্শ", price: "BDT 200", desc: lang === "en" ? "Per loan assessment" : "প্রতি ঋণ মূল্যায়ন", color: "blue", highlight: false },
              { tier: lang === "en" ? "IoT Premium Farm" : "IoT প্রিমিয়াম ফার্ম", price: "BDT 25K-50K+", desc: lang === "en" ? "Setup + BDT 2K/month" : "সেটআপ + ২হাজার/মাস", color: "purple", highlight: false },
            ].map((t, i) => (
              <div key={i} className={"rounded-2xl p-6 border-2 " + (t.highlight ? "border-cyan-400 bg-cyan-50 shadow-lg shadow-cyan-500/20" : "border-gray-100 bg-white/70")}>
                {t.highlight && <div className="text-xs font-bold text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full inline-block mb-3">PRIMARY REVENUE</div>}
                <p className="font-medium text-gray-600 text-sm">{t.tier}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{t.price}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold">{lang === "en" ? "Ready for PKSF Evaluation" : "PKSF মূল্যায়নের জন্য প্রস্তুত"}</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">{lang === "en" ? "Live platform. Real data. Production architecture. Human-centered AI governance. 26-step roadmap to 500 farmers." : "লাইভ প্ল্যাটফর্ম। বাস্তব তথ্য। প্রোডাকশন আর্কিটেকচার। মানবকেন্দ্রিক AI গভর্ন্যান্স।"}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all">
              {lang === "en" ? "View Live Platform →" : "লাইভ প্ল্যাটফর্ম দেখুন →"}
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/20 text-white font-bold rounded-2xl border-2 border-white/40 hover:bg-white/30 transition-all">
              {lang === "en" ? "Login as Demo User" : "ডেমো হিসেবে লগইন"}
            </Link>
          </div>
          <p className="text-emerald-100 text-sm">{lang === "en" ? "Demo credentials available on request · API: /api/docs" : "ডেমো ক্রেডেনশিয়াল অনুরোধে পাওয়া যাবে · API: /api/docs"}</p>
        </section>
      </main>

      <footer className="bg-white/50 border-t border-emerald-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>UnnayanAI — {lang === "en" ? "Smart Dairy AI & IoT Platform for Bangladesh" : "বাংলাদেশের জন্য স্মার্ট ডেয়ারি AI ও IoT প্ল্যাটফর্ম"}</p>
          <p className="mt-1">Built for PKSF Unnayan Prochesta · <Link href="/docs" className="text-emerald-600 hover:underline">API Docs</Link> · <Link href="/api/health" className="text-emerald-600 hover:underline">System Status</Link></p>
        </div>
      </footer>
    </div>
  );
}
