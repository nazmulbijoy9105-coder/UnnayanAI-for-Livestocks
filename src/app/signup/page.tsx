"use client";
import { useState } from "react";
import Link from "next/link";

const ROLES = [
  { key: "farmer", icon: "🌾", en: "Farmer", bn: "কৃষক", desc: "Register your farm and cattle" },
  { key: "ngo", icon: "🏢", en: "NGO / Agent", bn: "NGO এজেন্ট", desc: "Manage farmer clusters" },
  { key: "mfi", icon: "💳", en: "MFI Officer", bn: "MFI কর্মকর্তা", desc: "Credit assessment & loans" },
  { key: "investor", icon: "💰", en: "Investor / Donor", bn: "বিনিয়োগকারী", desc: "Track SDG impact" },
  { key: "admin", icon: "⚙️", en: "Admin", bn: "অ্যাডমিন", desc: "Platform management" },
];

const DISTRICTS = ["Dhaka","Chittagong","Rajshahi","Khulna","Sylhet","Barisal","Rangpur","Mymensingh","Comilla","Gazipur","Tangail","Bogra","Jessore","Pabna","Sirajganj"];

export default function SignupPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [role, setRole] = useState("farmer");
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"", phone:"", organization:"", district:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role, phone: form.phone, organization: form.organization, district: form.district }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = `/dashboard/${data.user.role}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const selectedRole = ROLES.find(r => r.key === role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-10">
      <div className="w-full max-w-lg mx-4">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {lang === "en" ? "Join UnnayanAI" : "উন্নয়নAI-তে যোগ দিন"}
          </h1>
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8">
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 block mb-3">{lang === "en" ? "I am registering as" : "আমি নিবন্ধন করছি"}</label>
            <div className="grid grid-cols-5 gap-2">
              {ROLES.map(r => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)}
                  className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border text-xs font-medium transition-all ${role === r.key ? "bg-emerald-500 border-emerald-500 text-white shadow-md scale-105" : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50"}`}>
                  <span className="text-xl">{r.icon}</span>
                  <span className="leading-tight text-center">{lang === "en" ? r.en : r.bn}</span>
                </button>
              ))}
            </div>
            {selectedRole && <p className="text-xs text-emerald-600 mt-2 text-center bg-emerald-50 py-1.5 px-3 rounded-lg">{selectedRole.desc}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Full Name" : "পূর্ণ নাম"}</label>
              <input type="text" value={form.name} onChange={e => update("name", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                placeholder={lang === "en" ? "Your full name" : "আপনার পূর্ণ নাম"} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Email Address" : "ইমেইল ঠিকানা"}</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Phone Number" : "ফোন নম্বর"}</label>
              <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "District" : "জেলা"}</label>
              <select value={form.district} onChange={e => update("district", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800">
                <option value="">{lang === "en" ? "Select district" : "জেলা নির্বাচন করুন"}</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {["ngo","mfi","investor"].includes(role) && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Organization Name" : "প্রতিষ্ঠানের নাম"}</label>
                <input type="text" value={form.organization} onChange={e => update("organization", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                  placeholder={lang === "en" ? "Your organization" : "আপনার প্রতিষ্ঠান"} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Password" : "পাসওয়ার্ড"}</label>
                <input type="password" value={form.password} onChange={e => update("password", e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">{lang === "en" ? "Confirm" : "নিশ্চিত করুন"}</label>
                <input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800"
                  placeholder="••••••••" />
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            {role === "ngo" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-xl">
                {lang === "en" ? "NGO accounts require admin approval before activation." : "NGO অ্যাকাউন্ট সক্রিয় হতে অ্যাডমিন অনুমোদন প্রয়োজন।"}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-60">
              {loading ? (lang === "en" ? "Creating account..." : "অ্যাকাউন্ট তৈরি হচ্ছে...") : (lang === "en" ? "Create Account" : "অ্যাকাউন্ট তৈরি করুন")}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {lang === "en" ? "Already have an account?" : "ইতিমধ্যে অ্যাকাউন্ট আছে?"}{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:underline">{lang === "en" ? "Sign In" : "লগইন করুন"}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
