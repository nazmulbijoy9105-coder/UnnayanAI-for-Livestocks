"use client";
import { useEffect, useState } from "react";

export default function MFIDashboard() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewForm, setReviewForm] = useState({ decision: "", amount_approved: "", notes: "" });
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [applyForm, setApplyForm] = useState({ farmer_id: "", amount: "" });

  const getHeaders = () => ({ Authorization: "Bearer " + localStorage.getItem("token") });

  const loadData = async () => {
    try {
      const [st, apps, fm] = await Promise.all([
        fetch("/api/mfi?action=stats", { headers: getHeaders() }).then(r => r.json()),
        fetch("/api/mfi?action=applications" + (statusFilter ? "&status=" + statusFilter : ""), { headers: getHeaders() }).then(r => r.json()),
        fetch("/api/mfi?action=farmers", { headers: getHeaders() }).then(r => r.json()),
      ]);
      setStats(st); setApplications(apps.applications || []); setFarmers(fm.farmers || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (!["mfi","admin"].includes(parsed.role)) { window.location.href = "/dashboard/" + parsed.role; return; }
    setUser(parsed);
    loadData();
  }, [statusFilter]);

  const submitReview = async (appId) => {
    setReviewing(true); setMessage("");
    try {
      const res = await fetch("/api/mfi", { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ action: "review", application_id: appId, ...reviewForm, amount_approved: parseFloat(reviewForm.amount_approved) || 0 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessage("Application " + reviewForm.decision + "d successfully!");
      setSelectedApp(null); setReviewForm({ decision: "", amount_approved: "", notes: "" });
      await loadData();
    } catch(e) { setMessage(e.message || "Error"); } finally { setReviewing(false); }
  };

  const submitApplication = async (e) => {
    e.preventDefault(); setReviewing(true); setMessage("");
    try {
      const res = await fetch("/api/mfi", { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ action: "apply", amount_requested: parseFloat(applyForm.amount) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessage(`Application submitted! Credit Score: ${data.credit_score} (${data.grade}) - ${data.message}`);
      setApplyForm({ farmer_id: "", amount: "" });
      await loadData();
    } catch(e) { setMessage(e.message || "Error"); } finally { setReviewing(false); }
  };

  if (!user) return null;
  const ic = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 text-gray-800";

  const STATUS_COLORS = { pending:"bg-amber-100 text-amber-700", approved:"bg-green-100 text-green-700", rejected:"bg-red-100 text-red-700", human_review:"bg-purple-100 text-purple-700" };
  const RISK_COLORS = { LOW:"bg-green-100 text-green-700", MEDIUM:"bg-amber-100 text-amber-700", HIGH:"bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><span className="text-white">💳</span></div>
            <div><p className="font-bold text-blue-700">UnnayanAI</p><p className="text-xs text-blue-400">{lang === "en" ? "MFI Credit Officer Portal" : "MFI ক্রেডিট পোর্টাল"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full">{lang === "en" ? "বাংলা" : "English"}</button>
            <span className="text-sm text-gray-600 hidden md:block">👤 {user?.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">{lang === "en" ? "Welcome, " + user.name : "স্বাগতম, " + user.name}</h1>
          <p className="text-blue-100 mt-1 text-sm">{user.organization || "MFI Officer"}</p>
          {stats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{stats.pending}</p><p className="text-blue-100 text-xs">{lang === "en" ? "Pending Review" : "পর্যালোচনা বাকি"}</p></div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{stats.approved}</p><p className="text-blue-100 text-xs">{lang === "en" ? "Approved" : "অনুমোদিত"}</p></div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{stats.rejected}</p><p className="text-blue-100 text-xs">{lang === "en" ? "Rejected" : "প্রত্যাখ্যাত"}</p></div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">৳{(stats.total_disbursed/1000).toFixed(0)}K</p><p className="text-blue-100 text-xs">{lang === "en" ? "Disbursed" : "বিতরণকৃত"}</p></div>
            </div>
          )}
        </div>

        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-blue-100 overflow-x-auto">
          {[{key:"overview",en:"Overview",bn:"পরিচিতি"},{key:"applications",en:"Loan Applications",bn:"ঋণ আবেদন"},{key:"farmers",en:"Farmer Scores",bn:"কৃষক স্কোর"},{key:"apply",en:"New Application",bn:"নতুন আবেদন"}].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setMessage(""); }} className={"px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all " + (tab === t.key ? "bg-blue-500 text-white shadow-md" : "text-gray-500 hover:bg-blue-50")}>{lang === "en" ? t.en : t.bn}</button>
          ))}
        </div>

        {message && <div className={"px-4 py-3 rounded-xl text-sm font-medium border " + (message.includes("Error") || message.includes("error") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700")}>{message}</div>}

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Pending Reviews" : "পর্যালোচনা বাকি"}</h3>
              {applications.filter(a => a.status === "pending" || a.status === "human_review").slice(0,5).map((app, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{app.farmer_name}</p><p className="text-xs text-gray-400">৳{app.amount_requested?.toLocaleString()} · Score: {app.credit_score}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (RISK_COLORS[app.risk_level] || "bg-gray-100 text-gray-700")}>{app.risk_level}</span>
                    <button onClick={() => { setSelectedApp(app); setTab("applications"); }} className="text-xs text-blue-600 hover:underline">{lang === "en" ? "Review" : "পর্যালোচনা"}</button>
                  </div>
                </div>
              ))}
              {applications.filter(a => a.status === "pending" || a.status === "human_review").length === 0 && <p className="text-gray-400 text-sm text-center py-4">{lang === "en" ? "No pending reviews" : "কোন পর্যালোচনা বাকি নেই"}</p>}
            </div>
            <div className="bg-white/70 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{lang === "en" ? "Top Farmers by Score" : "সেরা স্কোরের কৃষক"}</h3>
              {farmers.slice(0,5).map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{f.name}</p><p className="text-xs text-gray-400">{f.district} · {f.cattle_count || 0} cattle</p></div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{f.avg_yield ? parseFloat(f.avg_yield).toFixed(1) + "L" : "—"}</p>
                    <p className="text-xs text-gray-400">{f.milk_logs} logs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["","pending","human_review","approved","rejected"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={"text-xs px-3 py-1.5 rounded-full border " + (statusFilter === s ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600 hover:border-blue-300")}>{s || "All"}</button>
              ))}
            </div>
            {selectedApp && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">{lang === "en" ? "Review Application" : "আবেদন পর্যালোচনা"}</h3>
                  <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-blue-700">{selectedApp.farmer_name}</p><p className="text-xs text-gray-500">Farmer</p></div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-emerald-700">{selectedApp.credit_score}</p><p className="text-xs text-gray-500">Credit Score ({selectedApp.credit_grade})</p></div>
                  <div className={"rounded-xl p-3 text-center " + (RISK_COLORS[selectedApp.risk_level] || "bg-gray-50")}><p className="text-lg font-bold">{selectedApp.risk_level}</p><p className="text-xs">Risk Level</p></div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-purple-700">৳{selectedApp.amount_requested?.toLocaleString()}</p><p className="text-xs text-gray-500">Requested</p></div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {["approve","reject","human_review"].map(d => (
                      <button key={d} onClick={() => setReviewForm(f => ({...f, decision: d}))} className={"py-2 rounded-xl border-2 text-sm font-medium transition-all " + (reviewForm.decision === d ? (d==="approve"?"border-green-500 bg-green-50 text-green-700":d==="reject"?"border-red-500 bg-red-50 text-red-700":"border-purple-500 bg-purple-50 text-purple-700") : "border-gray-200 text-gray-600")}>{d === "human_review" ? "Escalate" : d.charAt(0).toUpperCase()+d.slice(1)}</button>
                    ))}
                  </div>
                  {reviewForm.decision === "approve" && <div><label className="text-sm font-medium text-gray-600 block mb-1">Approved Amount (BDT)</label><input type="number" value={reviewForm.amount_approved} onChange={e=>setReviewForm(f=>({...f,amount_approved:e.target.value}))} className={ic} placeholder={selectedApp.amount_requested}/></div>}
                  <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Review Notes" : "পর্যালোচনার নোট"}</label><textarea value={reviewForm.notes} onChange={e=>setReviewForm(f=>({...f,notes:e.target.value}))} className={ic + " h-24 resize-none"} placeholder={lang === "en" ? "Add review notes..." : "পর্যালোচনার নোট লিখুন..."}/></div>
                  <button onClick={() => submitReview(selectedApp.id)} disabled={!reviewForm.decision || reviewing} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold disabled:opacity-60">{reviewing ? "Submitting..." : (lang === "en" ? "Submit Review" : "পর্যালোচনা জমা দিন")}</button>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="p-4 border-b border-blue-50"><h3 className="font-bold text-gray-800">{lang === "en" ? "Loan Applications" : "ঋণ আবেদন"} ({applications.length})</h3></div>
              {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : applications.length === 0 ? <div className="p-8 text-center text-gray-400">{lang === "en" ? "No applications" : "কোন আবেদন নেই"}</div> :
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50/50"><tr>{["Farmer","Amount","Score","Risk","Status","Date","Action"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {applications.map((app, i) => (
                        <tr key={i} className="hover:bg-blue-50/30">
                          <td className="px-4 py-3"><p className="text-sm font-medium text-gray-800">{app.farmer_name}</p><p className="text-xs text-gray-400">{app.farmer_district}</p></td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">৳{app.amount_requested?.toLocaleString()}</td>
                          <td className="px-4 py-3"><span className="text-sm font-bold text-blue-600">{app.credit_score}</span><span className="text-xs text-gray-400 ml-1">({app.credit_grade})</span></td>
                          <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-full font-medium " + (RISK_COLORS[app.risk_level] || "bg-gray-100 text-gray-600")}>{app.risk_level}</span></td>
                          <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-full font-medium " + (STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600")}>{app.status}</span></td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {(app.status === "pending" || app.status === "human_review") && (
                              <button onClick={() => { setSelectedApp(app); window.scrollTo(0,0); }} className="text-xs text-blue-600 hover:underline font-medium">{lang === "en" ? "Review →" : "পর্যালোচনা →"}</button>
                            )}
                            {app.status === "approved" && <span className="text-xs text-green-600">✓ ৳{app.amount_approved?.toLocaleString()}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        )}

        {tab === "farmers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="p-4 border-b border-blue-50"><h3 className="font-bold text-gray-800">{lang === "en" ? "Farmers by Milk Performance" : "দুধ উৎপাদনে কৃষকরা"} ({farmers.length})</h3></div>
            {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50/50"><tr>{["Farmer","District","Cattle","Avg Yield","Milk Logs","Applications"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {farmers.map((f, i) => (
                      <tr key={i} className="hover:bg-blue-50/30">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{f.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{f.district || "—"}</td>
                        <td className="px-4 py-3 text-sm text-center">{f.cattle_count || 0}</td>
                        <td className="px-4 py-3"><span className="text-sm font-bold text-emerald-600">{f.avg_yield ? parseFloat(f.avg_yield).toFixed(1) + "L" : "—"}</span></td>
                        <td className="px-4 py-3 text-sm text-center text-blue-600">{f.milk_logs || 0}</td>
                        <td className="px-4 py-3 text-sm text-center">{f.loan_applications || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}

        {tab === "apply" && (
          <div className="max-w-md">
            <div className="bg-white/70 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">{lang === "en" ? "Submit Loan Application" : "ঋণ আবেদন জমা দিন"}</h3>
              <p className="text-gray-500 text-sm mb-4">{lang === "en" ? "AI will calculate credit score automatically based on farmer data" : "AI স্বয়ংক্রিয়ভাবে ক্রেডিট স্কোর গণনা করবে"}</p>
              <form onSubmit={submitApplication} className="space-y-4">
                <div><label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Loan Amount (BDT)" : "ঋণের পরিমাণ (টাকা)"}</label><input type="number" min="1000" max="200000" value={applyForm.amount} onChange={e=>setApplyForm(f=>({...f,amount:e.target.value}))} required className={ic} placeholder="50000"/></div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-blue-700 text-sm font-medium">{lang === "en" ? "Loan Limits by Grade" : "গ্রেড অনুযায়ী ঋণসীমা"}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p>A+ (80+): Up to BDT 1,00,000</p><p>A (70+): Up to BDT 75,000</p>
                    <p>B+ (60+): Up to BDT 50,000</p><p>B (50+): Up to BDT 30,000</p>
                    <p>C (40+): Up to BDT 15,000</p><p>D (&lt;40): Not eligible</p>
                  </div>
                </div>
                <button type="submit" disabled={reviewing} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold disabled:opacity-60">{reviewing ? "Submitting..." : (lang === "en" ? "Submit Application" : "আবেদন জমা দিন")}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
