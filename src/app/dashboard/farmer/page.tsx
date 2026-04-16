"use client";
import { useEffect, useState } from "react";

export default function FarmerDashboard() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("overview");
  const [milkLogs, setMilkLogs] = useState([]);
  const [milkSummary, setMilkSummary] = useState(null);
  const [cattle, setCattle] = useState([]);
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [milkForm, setMilkForm] = useState({ cow_id: "", date: new Date().toISOString().slice(0,10), morning_yield: "", evening_yield: "" });
  const [cattleForm, setCattleForm] = useState({ cow_id: "", breed: "", age_months: "", weight_kg: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const BREEDS = ["Local (Deshi)","Sahiwal","Friesian","Jersey","Brahman","Hariana","Cross Breed"];
  const ic = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-gray-50 text-gray-800";

  const loadData = async (token) => {
    const headers = { Authorization: "Bearer " + token };
    const [m, c, cr] = await Promise.all([
      fetch("/api/milk", { headers }).then(r => r.json()),
      fetch("/api/cattle", { headers }).then(r => r.json()),
      fetch("/api/credit", { headers }).then(r => r.json()),
    ]);
    setMilkLogs(m.logs || []);
    setMilkSummary(m.summary || null);
    setCattle(c.cattle || []);
    setCredit(cr);
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== "farmer") { window.location.href = "/dashboard/" + parsed.role; return; }
    setUser(parsed);
    loadData(t).finally(() => setLoading(false));
  }, []);

  async function saveMilkLog(e) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      const t = localStorage.getItem("token");
      const res = await fetch("/api/milk", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ ...milkForm, morning_yield: parseFloat(milkForm.morning_yield)||0, evening_yield: parseFloat(milkForm.evening_yield)||0 }) });
      const data = await res.json();
      if (!res.ok) { setMsgType("error"); throw new Error(data.detail || "Error saving"); }
      setMsgType(data.warnings?.length > 0 ? "warning" : "success");
      setMessage(data.warnings?.length > 0 ? "Saved with warning: " + data.warnings[0] : "Milk log saved! Total: " + data.total_yield + "L");
      setMilkForm({ cow_id: "", date: new Date().toISOString().slice(0,10), morning_yield: "", evening_yield: "" });
      await loadData(t);
    } catch(err) { setMsgType("error"); setMessage(err.message || "Error"); } finally { setSaving(false); }
  }

  async function saveCattle(e) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      const t = localStorage.getItem("token");
      const res = await fetch("/api/cattle", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ ...cattleForm, age_months: parseInt(cattleForm.age_months)||0, weight_kg: parseFloat(cattleForm.weight_kg)||0 }) });
      const data = await res.json();
      if (!res.ok) { setMsgType("error"); throw new Error(data.detail || "Error"); }
      setMsgType("success"); setMessage("Cattle registered: " + cattleForm.cow_id);
      setCattleForm({ cow_id: "", breed: "", age_months: "", weight_kg: "" });
      await loadData(t);
    } catch(err) { setMsgType("error"); setMessage(err.message || "Error"); } finally { setSaving(false); }
  }

  if (!user) return null;
  const totalToday = milkLogs.filter(l => l.date?.slice(0,10) === new Date().toISOString().slice(0,10)).reduce((s,l) => s+l.total_yield, 0);
  const msgClass = msgType === "success" ? "bg-green-50 border-green-200 text-green-700" : msgType === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700";
  const scoreColor = !credit?.score ? "from-gray-400 to-gray-500" : credit.score >= 70 ? "from-emerald-400 to-green-500" : credit.score >= 50 ? "from-amber-400 to-orange-500" : "from-red-400 to-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center"><span className="text-white text-lg">🌾</span></div>
            <div><p className="font-bold text-emerald-700">UnnayanAI</p><p className="text-xs text-emerald-500">{lang === "en" ? "Farmer Portal" : "কৃষক পোর্টাল"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-full">{lang === "en" ? "বাংলা" : "English"}</button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">{lang === "en" ? "Welcome, " + user.name + "!" : "স্বাগতম, " + user.name + "!"}</h1>
          <p className="text-emerald-100 mt-1 text-sm">{user.district || ""}</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{cattle.length}</p><p className="text-emerald-100 text-xs">{lang === "en" ? "Cattle" : "গরু"}</p></div>
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{totalToday.toFixed(1)}L</p><p className="text-emerald-100 text-xs">{lang === "en" ? "Today" : "আজ"}</p></div>
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{milkSummary?.avg ? parseFloat(milkSummary.avg).toFixed(1) : "0"}L</p><p className="text-emerald-100 text-xs">{lang === "en" ? "Avg/day" : "গড়/দিন"}</p></div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-2xl font-bold">{credit?.score || 0}</p>
              <p className="text-emerald-100 text-xs">{credit?.grade ? "Grade " + credit.grade : (lang === "en" ? "Credit" : "ক্রেডিট")}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-emerald-100 overflow-x-auto">
          {[{key:"overview",en:"Overview",bn:"পরিচিতি"},{key:"milk",en:"Log Milk",bn:"দুধ লগ"},{key:"cattle",en:"My Cattle",bn:"আমার গরু"},{key:"credit",en:"Credit Score",bn:"ক্রেডিট স্কোর"}].map(t => (
            <button key={t.key} onClick={() => {setTab(t.key);setMessage("");}} className={"px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all " + (tab === t.key ? "bg-emerald-500 text-white shadow-md" : "text-gray-500 hover:bg-emerald-50")}>{lang === "en" ? t.en : t.bn}</button>
          ))}
        </div>

        {message && <div className={"px-4 py-3 rounded-xl text-sm font-medium border " + msgClass}>{message}</div>}

        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-emerald-600">{milkLogs.length}</p>
                <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Days logged" : "লগের দিন"}</p>
              </div>
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-cyan-600">{milkSummary?.total ? parseFloat(milkSummary.total).toFixed(0) : 0}L</p>
                <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Total milk" : "মোট দুধ"}</p>
              </div>
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-purple-600">{milkSummary?.best_day ? parseFloat(milkSummary.best_day).toFixed(1) : 0}L</p>
                <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Best day" : "সেরা দিন"}</p>
              </div>
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                <p className={"text-3xl font-bold " + (milkSummary?.trend_7day_pct > 0 ? "text-green-600" : milkSummary?.trend_7day_pct < 0 ? "text-red-600" : "text-gray-600")}>
                  {milkSummary?.trend_7day_pct > 0 ? "+" : ""}{milkSummary?.trend_7day_pct || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "7-day trend" : "৭ দিনের ট্রেন্ড"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">{lang === "en" ? "Recent Milk Logs" : "সাম্প্রতিক দুধ লগ"}</h3>
                {loading ? <p className="text-gray-400 text-sm">Loading...</p> : milkLogs.length === 0 ?
                  <div className="text-center py-4"><p className="text-gray-400 text-sm">{lang === "en" ? "No milk logs yet" : "কোন লগ নেই"}</p><button onClick={() => setTab("milk")} className="mt-2 text-xs text-emerald-600 hover:underline">{lang === "en" ? "Log first entry →" : "প্রথম এন্ট্রি →"}</button></div> :
                  milkLogs.slice(0,5).map((l,i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div><p className="text-sm font-medium text-gray-700">{l.cow_id}</p><p className="text-xs text-gray-400">{l.date?.slice(0,10)} · 🌅{l.morning_yield}L 🌙{l.evening_yield}L</p></div>
                      <p className="font-bold text-emerald-600">{l.total_yield}L</p>
                    </div>
                  ))}
              </div>
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">{lang === "en" ? "Credit Overview" : "ক্রেডিট সারসংক্ষেপ"}</h3>
                {credit && credit.score > 0 ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={"w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br " + scoreColor}>{credit.score}</div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">Grade {credit.grade}</p>
                        <p className="text-sm text-gray-500">{credit.risk} Risk</p>
                        <p className="text-xs text-emerald-600 mt-1">{credit.loan_eligible}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(lang === "en" ? credit.recommendations_en : credit.recommendations_bn)?.slice(0,2).map((r,i) => (
                        <p key={i} className="text-xs text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg">→ {r}</p>
                      ))}
                    </div>
                  </div>
                ) : <div className="text-center py-4"><p className="text-gray-400 text-sm">{lang === "en" ? "Log milk to build credit score" : "স্কোরের জন্য দুধ লগ করুন"}</p></div>}
              </div>
            </div>
          </div>
        )}

        {tab === "milk" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Log Milk Yield" : "দুধ লগ করুন"}</h3>
              <form onSubmit={saveMilkLog} className="space-y-4">
                <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Cow" : "গরু"}</label>
                  <select value={milkForm.cow_id} onChange={e => setMilkForm(f=>({...f,cow_id:e.target.value}))} required className={ic}>
                    <option value="">{lang === "en" ? "Select cow" : "গরু নির্বাচন"}</option>
                    {cattle.map(c => <option key={c.id} value={c.cow_id}>{c.cow_id} ({c.breed})</option>)}
                    <option value="general">{lang === "en" ? "All cows combined" : "সব গরু মিলিয়ে"}</option>
                  </select></div>
                <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Date" : "তারিখ"}</label><input type="date" value={milkForm.date} onChange={e=>setMilkForm(f=>({...f,date:e.target.value}))} required className={ic} max={new Date().toISOString().slice(0,10)}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "🌅 Morning (L)" : "🌅 সকাল (লি)"}</label><input type="number" step="0.1" min="0" max="30" value={milkForm.morning_yield} onChange={e=>setMilkForm(f=>({...f,morning_yield:e.target.value}))} className={ic} placeholder="0.0"/></div>
                  <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "🌙 Evening (L)" : "🌙 সন্ধ্যা (লি)"}</label><input type="number" step="0.1" min="0" max="30" value={milkForm.evening_yield} onChange={e=>setMilkForm(f=>({...f,evening_yield:e.target.value}))} className={ic} placeholder="0.0"/></div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                  <p className="text-emerald-700 font-bold text-lg">Total: {((parseFloat(milkForm.morning_yield)||0)+(parseFloat(milkForm.evening_yield)||0)).toFixed(1)}L</p>
                  <p className="text-emerald-500 text-xs">Rule engine will validate before saving</p>
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg disabled:opacity-60">{saving ? "Validating & Saving..." : (lang === "en" ? "Save Milk Log" : "সংরক্ষণ করুন")}</button>
              </form>
            </div>
            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">{lang === "en" ? "Milk History" : "দুধের ইতিহাস"} ({milkLogs.length})</h3>
                {milkSummary?.trend_7day_pct !== undefined && (
                  <span className={"text-xs px-2 py-1 rounded-full font-medium " + (milkSummary.trend_7day_pct > 0 ? "bg-green-100 text-green-700" : milkSummary.trend_7day_pct < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>
                    {milkSummary.trend_7day_pct > 0 ? "↑" : milkSummary.trend_7day_pct < 0 ? "↓" : "→"} {Math.abs(milkSummary.trend_7day_pct)}% trend
                  </span>
                )}
              </div>
              {milkLogs.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">{lang === "en" ? "No logs yet" : "কোন লগ নেই"}</p> :
                <div className="space-y-2 max-h-80 overflow-y-auto">{milkLogs.map((l,i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div><p className="text-sm font-medium text-gray-700">{l.cow_id}</p><p className="text-xs text-gray-400">{l.date?.slice(0,10)} · 🌅{l.morning_yield}L 🌙{l.evening_yield}L</p></div>
                    <p className="font-bold text-emerald-600">{l.total_yield}L</p>
                  </div>
                ))}</div>}
            </div>
          </div>
        )}

        {tab === "cattle" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Register Cattle" : "গরু নিবন্ধন"}</h3>
              <form onSubmit={saveCattle} className="space-y-4">
                <div><label className="text-sm font-medium text-gray-600 block mb-1">Cow ID / {lang === "en" ? "Name" : "নাম"}</label><input type="text" value={cattleForm.cow_id} onChange={e=>setCattleForm(f=>({...f,cow_id:e.target.value}))} required className={ic} placeholder="COW-001 or Lali"/></div>
                <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Breed" : "জাত"}</label>
                  <select value={cattleForm.breed} onChange={e=>setCattleForm(f=>({...f,breed:e.target.value}))} required className={ic}>
                    <option value="">{lang === "en" ? "Select breed" : "জাত নির্বাচন"}</option>
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Age (months)" : "বয়স (মাস)"}</label><input type="number" min="0" value={cattleForm.age_months} onChange={e=>setCattleForm(f=>({...f,age_months:e.target.value}))} className={ic} placeholder="24"/></div>
                  <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Weight (kg)" : "ওজন (কেজি)"}</label><input type="number" min="0" value={cattleForm.weight_kg} onChange={e=>setCattleForm(f=>({...f,weight_kg:e.target.value}))} className={ic} placeholder="250"/></div>
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg disabled:opacity-60">{saving ? "Registering..." : (lang === "en" ? "Register Cattle" : "গরু নিবন্ধন করুন")}</button>
              </form>
            </div>
            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "My Cattle" : "আমার গরু"} ({cattle.length})</h3>
              {cattle.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">{lang === "en" ? "No cattle yet" : "কোন গরু নেই"}</p> :
                <div className="space-y-3">{cattle.map((c,i) => (
                  <div key={i} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-1"><p className="font-bold text-gray-800">🐄 {c.cow_id}</p><span className={"text-xs px-2 py-1 rounded-full " + (["Friesian","Jersey","Sahiwal"].includes(c.breed) ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700")}>{c.breed}</span></div>
                    <p className="text-xs text-gray-500">{c.age_months}mo · {c.weight_kg}kg</p>
                  </div>
                ))}</div>}
            </div>
          </div>
        )}

        {tab === "credit" && (
          <div className="space-y-6">
            {!credit || credit.score === 0 ?
              <div className="bg-white/70 border border-emerald-100 rounded-2xl p-8 shadow-sm text-center">
                <p className="text-5xl mb-4">📊</p>
                <p className="font-bold text-gray-800 text-xl">{lang === "en" ? "No Credit Score Yet" : "এখনো স্কোর নেই"}</p>
                <p className="text-gray-500 text-sm mt-2">{lang === "en" ? "Register cattle and log milk daily for 7+ days" : "গরু নিবন্ধন ও ৭+ দিন দুধ লগ করুন"}</p>
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={() => setTab("cattle")} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">{lang === "en" ? "Register Cattle" : "গরু নিবন্ধন"}</button>
                  <button onClick={() => setTab("milk")} className="px-6 py-3 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600">{lang === "en" ? "Log Milk" : "দুধ লগ"}</button>
                </div>
              </div>
            : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm text-center">
                    <p className="text-gray-500 text-sm mb-3">{lang === "en" ? "Credit Score" : "ক্রেডিট স্কোর"}</p>
                    <div className={"w-28 h-28 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl bg-gradient-to-br " + scoreColor}>{credit.score}</div>
                    <p className="text-2xl font-bold text-gray-800 mt-4">Grade {credit.grade}</p>
                    <span className={"text-sm px-3 py-1 rounded-full font-medium mt-2 inline-block " + (credit.risk === "Very Low" || credit.risk === "Low" ? "bg-green-100 text-green-700" : credit.risk.includes("Medium") ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{credit.risk} Risk</span>
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-emerald-700 font-semibold text-sm">{credit.loan_eligible}</p>
                    </div>
                    <span className={"text-xs px-2 py-1 rounded-full mt-2 inline-block " + (credit.data_quality === "high" ? "bg-green-100 text-green-600" : credit.data_quality === "medium" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600")}>
                      Data quality: {credit.data_quality}
                    </span>
                  </div>
                  <div className="md:col-span-2 bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Score Breakdown (100 points)" : "স্কোরের বিবরণ (১০০ পয়েন্ট)"}</h3>
                    <div className="space-y-4">
                      {credit.factors && Object.entries(credit.factors).map(([key, val]) => {
                        const f = val as {score:number;max:number};
                        const pct = Math.round((f.score / f.max) * 100);
                        const labels = { milk_yield: {en:"Milk Yield (30pts)",bn:"দুধ উৎপাদন"}, data_consistency: {en:"Data Consistency (20pts)",bn:"তথ্যের ধারাবাহিকতা"}, herd_quality: {en:"Herd Quality (20pts)",bn:"পালের মান"}, engagement: {en:"Platform Engagement (15pts)",bn:"প্ল্যাটফর্ম ব্যবহার"}, yield_trend: {en:"Yield Trend (15pts)",bn:"উৎপাদনের ধারা"} };
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{lang === "en" ? labels[key]?.en || key : labels[key]?.bn || key}</span>
                              <span className="font-bold text-gray-800">{f.score}/{f.max}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className={"h-full rounded-full transition-all " + (pct >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-500" : pct >= 50 ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-gradient-to-r from-red-400 to-orange-500")} style={{width: pct + "%"}}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3">{lang === "en" ? "AI Explanation" : "AI ব্যাখ্যা"}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{lang === "en" ? credit.explanation_en : credit.explanation_bn}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">{lang === "en" ? "Recommendations:" : "পরামর্শ:"}</p>
                    {(lang === "en" ? credit.recommendations_en : credit.recommendations_bn)?.map((r,i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <span className="text-emerald-500 font-bold mt-0.5">→</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                  {credit.next_review_days > 0 && (
                    <p className="mt-4 text-xs text-gray-400">{lang === "en" ? `Score updates automatically. Next data milestone in ${credit.next_review_days} more log days.` : `স্কোর স্বয়ংক্রিয়ভাবে আপডেট হয়। আরও ${credit.next_review_days} দিনের লগ দরকার।`}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
