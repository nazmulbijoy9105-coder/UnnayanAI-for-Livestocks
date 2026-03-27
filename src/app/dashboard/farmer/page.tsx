"use client";
import { useEffect, useState, useMemo } from "react";

// --- Types & Constants ---
type User = { id: string; name: string; email: string; role: string; district: string; phone: string; };
type MilkLog = { id: string; cow_id: string; date: string; morning_yield: number; evening_yield: number; total_yield: number; };
type Cattle = { id: string; cow_id: string; breed: string; age_months: number; weight_kg: number; };
type CreditScore = { score: number; grade: string; risk: string; explanation_en: string; explanation_bn: string; };

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-emerald-100 rounded-2xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block ml-1">{label}</label>
    {children}
  </div>
);

export default function FarmerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [tab, setTab] = useState("overview");
  const [milkLogs, setMilkLogs] = useState<MilkLog[]>([]);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [credit, setCredit] = useState<CreditScore | null>(null);
  const [loading, setLoading] = useState(true);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white/50 text-gray-800 transition-all";

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    
    const parsed = JSON.parse(u);
    setUser(parsed);

    const headers = { Authorization: `Bearer ${t}` };
    Promise.all([
      fetch("/api/milk", { headers }).then(r => r.json()),
      fetch("/api/cattle", { headers }).then(r => r.json()),
      fetch("/api/credit", { headers }).then(r => r.json()),
    ]).then(([milkData, cattleData, creditData]) => {
      setMilkLogs(milkData.logs || []);
      setCattle(cattleData.cattle || []);
      setCredit(creditData);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (!user || loading) return <div className="p-10 text-center font-bold text-emerald-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <header className="bg-white/70 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <h1 className="font-black text-emerald-700">UnnayanAI</h1>
        <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
          {lang === "en" ? "বাংলা" : "English"}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["overview", "milk", "cattle", "credit"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-100"}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold mb-4">{lang === "en" ? "Recent Yields" : "সাম্প্রতিক উৎপাদন"}</h3>
              {milkLogs.slice(0, 3).map((l, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-emerald-50 last:border-0">
                  <span className="text-gray-600 text-sm">{l.date}</span>
                  <span className="font-bold text-emerald-700">{l.total_yield}L</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "credit" && (
          <Card className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-8 border-emerald-50 flex items-center justify-center relative">
              <span className="text-4xl font-black text-emerald-700">{credit?.score || 0}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Grade {credit?.grade || 'N/A'}</h3>
            <p className="text-sm mt-1 text-gray-500">{credit?.risk || 'Calculating'} Risk</p>
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-left">
              <p className="text-sm text-gray-700">
                {lang === 'en' ? credit?.explanation_en : credit?.explanation_bn}
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}