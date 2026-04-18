"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuditDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const getHeaders = () => ({ Authorization: "Bearer " + localStorage.getItem("token") });

  const load = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        fetch(`/api/audit?action=logs&filter=${filter}&page=${page}&limit=20`, { headers: getHeaders() }).then(r => r.json()),
        fetch("/api/audit?action=stats", { headers: getHeaders() }).then(r => r.json()),
      ]);
      setLogs(logsData.logs || []);
      setTotal(logsData.total || 0);
      setStats(statsData);
    } finally { setLoading(false); }
  };

  const verifyIntegrity = async () => {
    const data = await fetch("/api/audit?action=verify", { headers: getHeaders() }).then(r => r.json());
    setIntegrity(data);
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href = "/login"; return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== "admin") { window.location.href = "/dashboard/" + parsed.role; return; }
    load();
  }, [filter, page]);

  const ACTION_COLORS = { USER_SIGNUP:"bg-green-100 text-green-700", USER_LOGIN:"bg-blue-100 text-blue-700", RULE_BLOCK:"bg-red-100 text-red-700", RULE_WARN:"bg-amber-100 text-amber-700", RULE_APPROVE:"bg-emerald-100 text-emerald-700", SMS_MOCK_SENT:"bg-purple-100 text-purple-700", SMS_SENT:"bg-purple-100 text-purple-700", LOAN_APPLICATION:"bg-cyan-100 text-cyan-700", LOAN_APPROVED:"bg-green-100 text-green-700", LOAN_REJECTED:"bg-red-100 text-red-700", NGO_VISIT_REPORT:"bg-teal-100 text-teal-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center"><span className="text-white text-sm">🔐</span></div>
            <div><p className="font-bold text-gray-800">Audit Trail</p><p className="text-xs text-gray-400">Immutable hash-chained logs</p></div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs text-red-500 hover:underline">Logout</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center"><p className="text-3xl font-bold text-gray-800">{stats.total_entries}</p><p className="text-xs text-gray-500 mt-1">Total Log Entries</p></div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center"><p className="text-3xl font-bold text-blue-600">{stats.last_24h}</p><p className="text-xs text-gray-500 mt-1">Last 24 Hours</p></div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center"><p className="text-3xl font-bold text-emerald-600">{stats.hash_protected}</p><p className="text-xs text-gray-500 mt-1">Hash Protected</p></div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <button onClick={verifyIntegrity} className="text-sm bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 w-full">Verify Integrity</button>
              {integrity && <p className={"text-xs mt-2 font-bold " + (integrity.integrity === "INTACT" ? "text-green-600" : "text-red-600")}>● {integrity.integrity}</p>}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <h2 className="font-bold text-gray-800">Audit Logs ({total})</h2>
            <div className="flex gap-2 flex-wrap">
              {["","USER_SIGNUP","USER_LOGIN","RULE_BLOCK","RULE_WARN","SMS","LOAN"].map(f => (
                <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={"text-xs px-3 py-1.5 rounded-full border transition-all " + (filter === f ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:border-gray-400")}>{f || "All"}</button>
              ))}
            </div>
          </div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
            logs.length === 0 ? <div className="p-8 text-center text-gray-400">No audit logs yet</div> :
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>{["Time","User","Action","Detail","Hash"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log, i) => {
                    let detail = log.detail;
                    try { const p = JSON.parse(log.detail); detail = Object.entries(p).slice(0,2).map(([k,v]) => k+": "+v).join(" · "); } catch(e) {}
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3"><p className="text-sm font-medium text-gray-700">{log.user_name || "System"}</p><p className="text-xs text-gray-400">{log.user_role || ""}</p></td>
                        <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-full font-medium " + (ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700")}>{log.action}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{detail}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-300">{log.hash ? log.hash.slice(0,12) + "..." : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 flex items-center justify-between border-t border-gray-50">
                <p className="text-xs text-gray-400">Page {page} of {Math.ceil(total/20)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={page>=Math.ceil(total/20)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40">Next →</button>
                </div>
              </div>
            </div>
          }
        </div>
        {stats?.by_action && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Top Actions</h3>
            <div className="space-y-3">
              {stats.by_action.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={"text-xs px-2 py-1 rounded-full font-medium w-48 text-center " + (ACTION_COLORS[a.action] || "bg-gray-100 text-gray-700")}>{a.action}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full" style={{width: Math.round((a.count/stats.total_entries)*100)+"%"}}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-12 text-right">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
