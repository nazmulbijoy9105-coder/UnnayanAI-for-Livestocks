"use client";
import { useState } from "react";
import Link from "next/link";

const t = {
  en: {
    title: "UnnayanAI",
    subtitle: "Smart Dairy AI & IoT Platform",
    login: "Sign In",
    email: "Email Address",
    password: "Password",
    role: "I am a",
    submit: "Sign In",
    noAccount: "Don't have an account?",
    signup: "Sign Up",
    roles: {
      farmer: "Farmer",
      ngo: "NGO / Field Agent",
      mfi: "MFI Officer",
      investor: "Investor / Donor",
      admin: "Admin",
    },
    forgot: "Forgot password?",
    error: "Invalid email or password",
    loading: "Signing in...",
  },
  bn: {
    title: "উন্নয়নAI",
    subtitle: "স্মার্ট ডেয়ারি AI ও IoT প্ল্যাটফর্ম",
    login: "লগইন করুন",
    email: "ইমেইল ঠিকানা",
    password: "পাসওয়ার্ড",
    role: "আমি একজন",
    submit: "লগইন",
    noAccount: "অ্যাকাউন্ট নেই?",
    signup: "নিবন্ধন করুন",
    roles: {
      farmer: "কৃষক",
      ngo: "NGO / ফিল্ড এজেন্ট",
      mfi: "MFI কর্মকর্তা",
      investor: "বিনিয়োগকারী / দাতা",
      admin: "অ্যাডমিন",
    },
    forgot: "পাসওয়ার্ড ভুলে গেছেন?",
    error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়",
    loading: "লগইন হচ্ছে...",
  },
};

const ROLE_COLORS = {
  farmer: "emerald",
  ngo: "cyan",
  mfi: "blue",
  investor: "purple",
  admin: "red",
};

const ROLE_ICONS = {
  farmer: "🌾",
  ngo: "🏢",
  mfi: "💳",
  investor: "💰",
  admin: "⚙️",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://unnayanai-backend.onrender.com";

export default function LoginPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [role, setRole] = useState("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const txt = t[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || txt.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = `/dashboard/${data.user.role}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : txt.error);
    } finally {
      setLoading(false);
    }
  }

  const color = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "emerald";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {txt.title}
          </h1>
          <p className="text-emerald-600/70 text-sm mt-1">{txt.subtitle}</p>
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{txt.login}</h2>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 block mb-2">{txt.role}</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(txt.roles).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                    role === key
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                      : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <span className="text-lg">{ROLE_ICONS[key as keyof typeof ROLE_ICONS]}</span>
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{txt.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">{txt.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-60"
            >
              {loading ? txt.loading : txt.submit}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm">
            <Link href="#" className="text-emerald-600 hover:underline">{txt.forgot}</Link>
            <span className="text-gray-400">{txt.noAccount} <Link href="/signup" className="text-emerald-600 font-medium hover:underline">{txt.signup}</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
