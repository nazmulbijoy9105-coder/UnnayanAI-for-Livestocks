"use client";
import { useEffect, useState } from "react";

export default function NGODashboard() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerDetail, setFarmerDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");
  const [search, setSearch] = useState("");
  const [smsLogs, setSmsLogs] = useState([]);
  const [smsMsg, setSmsMsg] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);
  const [message, setMessage] = useState("");
  const DISTRICTS = ["Dhaka","Chittagong","Rajshahi","Khulna","Sylhet","Barisal","Rangpur","Mymensingh","Comilla","Gazipur","Tangail","Bogra","Jessore","Pabna","Sirajganj"];

  const getHeaders = () => ({ Authorization: "Bearer " + localStorage.getItem("token") });

  const loadData = async () => {
    try {
      const [st, fm] = await Promise.all([
        fetch("/api/ngo?action=stats" + (district ? "&district=" + district : ""), { headers: getHeaders() }).then(r => r.json()),
        fetch("/api/ngo?action=farmers" + (district ? "&district=" + district : ""), { headers: getHeaders() }).then(r => r.json()),
      ]);
      setStats(st);
      setFarmers(fm.farmers || []);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const loadSmsLogs = async () => {
    const data = await fetch("/api/sms", { headers: getHeaders() }).then(r => r.json()).catch(() => ({ sms_logs: [] }));
    setSmsLogs(data.sms_logs || []);
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (!["ngo","admin"].includes(parsed.role)) { window.location.href = "/dashboard/" + parsed.role; return; }
    setUser(parsed);
    loadData();
  }, [district]);

  const viewFarmer = async (farmer) => {
    setSelectedFarmer(farmer);
    setTab("farmer_detail");
    const detail = await fetch("/api/ngo?action=farmer_detail&farmer_id=" + farmer.id, { headers: getHeaders() }).then(r => r.json());
    setFarmerDetail(detail);
  };

  const sendAlert = async (farmerId, type) => {
    setSendingAlert(true);
    setMessage("");
    try {
      const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ action: "send_template", farmer_id: farmerId, type, lang }) });
      const data = await res.json();
      setMessage(data.mock ? "Alert queued (SMS not configured yet): " + (data.message || "") : "SMS sent successfully!");
    } catch(e) { setMessage("Error sending SMS"); } finally { setSendingAlert(false); }
  };

  const runYieldAlerts = async () => {
    setSendingAlert(true);
    setMessage("");
    try {
      const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ action: "check_yield_alerts" }) });
      const data = await res.json();
      setMessage("Yield alerts checked: " + data.alerts_sent + " alerts sent");
      await loadSmsLogs();
    } catch(e) { setMessage("Error"); } finally { setSendingAlert(false); }
  };

  const sendReminders = async () => {
    setSendingAlert(true);
    setMessage("");
    try {
      const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ action: "send_reminders" }) });
      const data = await res.json();
      setMessage("Reminders sent to " + data.reminders_sent + " inactive farmers");
    } catch(e) { setMessage("Error"); } finally { setSendingAlert(false); }
  };

  if (!user) return null;
  const filtered = farmers.filter(f => !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.phone?.includes(search) || f.district?.toLowerCase().includes(search.toLowerCase()));
  const inactive = farmers.filter(f => !f.last_log_date || new Date(f.last_log_date) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
  const ic = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 bg-gray-50 text-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center"><span className="text-white">🏢</span></div>
            <div><p className="font-bold text-cyan-700">UnnayanAI</p><p className="text-xs text-cyan-400">{lang === "en" ? "NGO / Field Agent Portal" : "NGO পোর্টাল"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-cyan-50 border border-cyan-200 text-cyan-600 px-3 py-1.5 rounded-full">{lang === "en" ? "বাংলা" : "English"}</button>
            <span className="text-sm text-gray-600 hidden md:block">👤 {user?.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {user?.status === "pending" ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl border border-amber-100">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{lang === "en" ? "Account Pending Approval" : "অ্যাকাউন্ট অনুমোদনের অপেক্ষায়"}</h2>
            <p className="text-gray-500 text-sm">{lang === "en" ? "Your NGO account is under review. Admin will activate it within 24 hours." : "আপনার NGO অ্যাকাউন্ট পর্যালোচনাধীন।"}</p>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="mt-6 text-sm text-red-500 hover:underline">Logout</button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
              <h1 className="text-2xl font-bold">{lang === "en" ? "Welcome, " + user.name : "স্বাগতম, " + user.name}</h1>
              <p className="text-cyan-100 mt-1 text-sm">{user.organization || "Field Agent"} · {user.district || "All Districts"}</p>
              {stats && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{stats.total_farmers}</p><p className="text-cyan-100 text-xs">{lang === "en" ? "Total Farmers" : "মোট কৃষক"}</p></div>
                  <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{stats.active_this_week}</p><p className="text-cyan-100 text-xs">{lang === "en" ? "Active This Week" : "এই সপ্তাহে সক্রিয়"}</p></div>
                  <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{parseFloat(stats.total_milk_liters).toFixed(0)}L</p><p className="text-cyan-100 text-xs">{lang === "en" ? "Total Milk" : "মোট দুধ"}</p></div>
                  <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{inactive.length}</p><p className="text-cyan-100 text-xs">{lang === "en" ? "Inactive 3+ days" : "৩+ দিন নিষ্ক্রিয়"}</p></div>
                </div>
              )}
            </div>

            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-cyan-100 overflow-x-auto">
              {[{key:"overview",en:"Overview",bn:"পরিচিতি"},{key:"farmers",en:"My Farmers",bn:"আমার কৃষকরা"},{key:"alerts",en:"SMS Alerts",bn:"SMS সতর্কতা"},{key:"sms_logs",en:"SMS Logs",bn:"SMS লগ"}].map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setMessage(""); if(t.key === "sms_logs") loadSmsLogs(); }}
                  className={"px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all " + (tab === t.key ? "bg-cyan-500 text-white shadow-md" : "text-gray-500 hover:bg-cyan-50")}>{lang === "en" ? t.en : t.bn}</button>
              ))}
            </div>

            {message && <div className="px-4 py-3 rounded-xl text-sm font-medium border bg-amber-50 border-amber-200 text-amber-700">{message}</div>}

            {tab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "District Breakdown" : "জেলাভিত্তিক বিভাজন"}</h3>
                    {stats.districts?.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">{lang === "en" ? "No district data yet" : "কোন জেলার তথ্য নেই"}</p> :
                      stats.districts?.slice(0,8).map((d, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <button onClick={() => { setDistrict(d.district); setTab("farmers"); }} className="text-sm font-medium text-cyan-600 hover:underline">{d.district}</button>
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">{d.count} farmers</span>
                        </div>
                      ))
                    }
                  </div>
                  <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Needs Attention" : "মনোযোগ প্রয়োজন"}</h3>
                    {inactive.length === 0 ? <p className="text-green-600 text-sm text-center py-4">✅ {lang === "en" ? "All farmers active!" : "সব কৃষক সক্রিয়!"}</p> :
                      inactive.slice(0,5).map((f, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{f.name}</p>
                            <p className="text-xs text-gray-400">{f.district} · {lang === "en" ? "Last log: " : "শেষ লগ: "}{f.last_log_date ? new Date(f.last_log_date).toLocaleDateString() : (lang === "en" ? "Never" : "কখনো না")}</p>
                          </div>
                          <button onClick={() => viewFarmer(f)} className="text-xs text-cyan-600 hover:underline">{lang === "en" ? "View →" : "দেখুন →"}</button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {tab === "farmers" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <input type="text" placeholder={lang === "en" ? "Search by name, phone, district..." : "নাম, ফোন বা জেলা দিয়ে খুঁজুন..."} value={search} onChange={e => setSearch(e.target.value)} className={ic + " flex-1"}/>
                  <select value={district} onChange={e => setDistrict(e.target.value)} className={ic + " md:w-48"}>
                    <option value="">{lang === "en" ? "All Districts" : "সব জেলা"}</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 overflow-hidden">
                  <div className="p-4 border-b border-cyan-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{lang === "en" ? "Farmers" : "কৃষকরা"} ({filtered.length})</h3>
                    <span className="text-xs text-gray-400">{lang === "en" ? "Click a farmer to view details" : "বিস্তারিত দেখতে ক্লিক করুন"}</span>
                  </div>
                  {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
                    filtered.length === 0 ? <div className="p-8 text-center text-gray-400">{lang === "en" ? "No farmers found" : "কোন কৃষক পাওয়া যায়নি"}</div> :
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-cyan-50/50">
                          <tr>{["Name","Phone","District","Cattle","Avg Yield","Last Log","Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filtered.map((f, i) => {
                            const lastLog = f.last_log_date ? new Date(f.last_log_date) : null;
                            const daysSince = lastLog ? Math.floor((Date.now() - lastLog.getTime()) / (1000*60*60*24)) : 999;
                            const actStatus = daysSince <= 1 ? "active" : daysSince <= 3 ? "recent" : "inactive";
                            return (
                              <tr key={i} className="hover:bg-cyan-50/30 cursor-pointer" onClick={() => viewFarmer(f)}>
                                <td className="px-4 py-3 text-sm font-medium text-cyan-600 hover:underline">{f.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{f.phone || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{f.district || "—"}</td>
                                <td className="px-4 py-3 text-sm text-center">{f.cattle_count || 0}</td>
                                <td className="px-4 py-3 text-sm font-medium text-emerald-600">{f.avg_yield ? parseFloat(f.avg_yield).toFixed(1) + "L" : "—"}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{lastLog ? lastLog.toLocaleDateString() : "Never"}</td>
                                <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-full " + (actStatus === "active" ? "bg-green-100 text-green-700" : actStatus === "recent" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{actStatus}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>
            )}

            {tab === "farmer_detail" && selectedFarmer && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setTab("farmers")} className="text-cyan-600 hover:underline text-sm">← {lang === "en" ? "Back to farmers" : "কৃষকদের কাছে ফিরুন"}</button>
                </div>
                <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedFarmer.name}</h2>
                      <p className="text-gray-500 text-sm">{selectedFarmer.phone} · {selectedFarmer.district}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => sendAlert(selectedFarmer.id, "reminder")} disabled={sendingAlert} className="text-xs bg-cyan-500 text-white px-3 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-60">
                        {sendingAlert ? "..." : (lang === "en" ? "Send Reminder" : "রিমাইন্ডার পাঠান")}
                      </button>
                      <button onClick={() => sendAlert(selectedFarmer.id, "credit_improved")} disabled={sendingAlert} className="text-xs bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-60">
                        {lang === "en" ? "Send Credit SMS" : "ক্রেডিট SMS"}
                      </button>
                    </div>
                  </div>
                  {!farmerDetail ? <div className="text-center py-8 text-gray-400">Loading farmer details...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-3xl font-bold text-emerald-600">{farmerDetail.cattle?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Cattle registered" : "নিবন্ধিত গরু"}</p>
                      </div>
                      <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100">
                        <p className="text-3xl font-bold text-cyan-600">{farmerDetail.summary?.total_logs || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Milk logs" : "দুধ লগ"}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                        <p className="text-3xl font-bold text-purple-600">{farmerDetail.summary?.avg_yield || 0}L</p>
                        <p className="text-xs text-gray-500 mt-1">{lang === "en" ? "Avg daily yield" : "গড় দৈনিক উৎপাদন"}</p>
                      </div>
                    </div>
                  )}
                </div>
                {farmerDetail?.milk_logs?.length > 0 && (
                  <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Recent Milk History" : "সাম্প্রতিক দুধের ইতিহাস"}</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {farmerDetail.milk_logs.slice(0,10).map((l, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div><p className="text-sm font-medium text-gray-700">{l.cow_id}</p><p className="text-xs text-gray-400">{l.date?.slice(0,10)} · 🌅{l.morning_yield}L 🌙{l.evening_yield}L</p></div>
                          <p className="font-bold text-emerald-600">{l.total_yield}L</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "alerts" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-2">{lang === "en" ? "Yield Drop Alerts" : "উৎপাদন হ্রাসের সতর্কতা"}</h3>
                    <p className="text-gray-500 text-sm mb-4">{lang === "en" ? "Automatically SMS farmers whose yield dropped 30%+ in last 2 days" : "গত ২ দিনে ৩০%+ উৎপাদন কমা কৃষকদের SMS পাঠান"}</p>
                    <button onClick={runYieldAlerts} disabled={sendingAlert} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold disabled:opacity-60">
                      {sendingAlert ? "Checking..." : (lang === "en" ? "Check & Send Yield Alerts" : "সতর্কতা চেক ও পাঠান")}
                    </button>
                  </div>
                  <div className="bg-white/70 border border-cyan-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-2">{lang === "en" ? "Inactivity Reminders" : "নিষ্ক্রিয়তার রিমাইন্ডার"}</h3>
                    <p className="text-gray-500 text-sm mb-4">{lang === "en" ? "SMS farmers who haven't logged in 2+ days" : "২+ দিন লগ না করা কৃষকদের রিমাইন্ডার পাঠান"}</p>
                    <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-amber-700 text-sm font-medium">{inactive.length} {lang === "en" ? "farmers inactive 3+ days" : "কৃষক ৩+ দিন ধরে নিষ্ক্রিয়"}</p>
                    </div>
                    <button onClick={sendReminders} disabled={sendingAlert} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold disabled:opacity-60">
                      {sendingAlert ? "Sending..." : (lang === "en" ? "Send Reminders to " + inactive.length + " Farmers" : inactive.length + " কৃষককে রিমাইন্ডার পাঠান")}
                    </button>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-amber-700 text-sm font-medium">⚠️ {lang === "en" ? "SMS Gateway Note" : "SMS গেটওয়ে নোট"}</p>
                  <p className="text-amber-600 text-xs mt-1">{lang === "en" ? "Add SMS_API_KEY in Vercel environment variables to enable real SMS via SSL Wireless Bangladesh. Currently running in mock mode — all SMS are logged to audit trail." : "বাস্তব SMS চালু করতে Vercel-এ SMS_API_KEY যোগ করুন। বর্তমানে mock মোডে চলছে।"}</p>
                </div>
              </div>
            )}

            {tab === "sms_logs" && (
              <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 overflow-hidden">
                <div className="p-6 border-b border-cyan-50">
                  <h2 className="font-bold text-gray-800">{lang === "en" ? "SMS Audit Log" : "SMS অডিট লগ"} ({smsLogs.length})</h2>
                </div>
                {smsLogs.length === 0 ? <div className="p-8 text-center text-gray-400">{lang === "en" ? "No SMS sent yet" : "এখনো কোন SMS পাঠানো হয়নি"}</div> :
                  <div className="divide-y divide-gray-50">
                    {smsLogs.map((log, i) => {
                      const detail = typeof log.detail === "string" ? JSON.parse(log.detail) : log.detail;
                      return (
                        <div key={i} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className={"text-xs px-2 py-1 rounded-full font-medium " + (log.action.includes("MOCK") ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>{log.action}</span>
                            <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          {detail?.phone && <p className="text-xs text-gray-500">To: {detail.phone}</p>}
                          {detail?.message && <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">{detail.message}</p>}
                        </div>
                      );
                    })}
                  </div>
                }
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
