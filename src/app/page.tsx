"use client";

import { useState } from "react";

const translations = {
  en: {
    title: "UnnayanAI for Livestocks",
    subtitle: "Smart Dairy AI & IoT Platform",
    live: "Live",
    overview: "Overview",
    dashboards: "Dashboards",
    iot: "IoT",
    analytics: "Analytics",
    governance: "Governance",
    sdg: "SDG",
    services: "Services",
    farmers: "Farmers",
    totalCattle: "Total Cattle",
    dailyMilk: "Daily Milk",
    aiAlerts: "AI Alerts",
    dataFlow: "Data Flow Layer",
    farmersInput: "SMS / Voice Input",
    agentsInput: "Agent Portal Input",
    iotSensors: "Environmental Data",
    validations: "Validations",
    storage: "Storage",
    aiCore: "AI & Analytics Layer",
    riskMatrix: "Risk Scoring Matrix",
    lowRisk: "Low Risk",
    mediumRisk: "Medium Risk",
    highRisk: "High Risk",
    autoExecute: "Auto-execute",
    humanReview: "Human review",
    agentOverride: "Agent override",
    dashboard: "Stakeholder Dashboards",
    iotEnv: "IoT & Environmental Layer",
    automation: "Automation Control",
    predictions: "AI Predictions",
    governanceSection: "Governance & Compliance",
    sdgSection: "SDG & Impact Metrics",
    security: "Security & Privacy",
    regulatory: "Regulatory Alignment",
    auditLog: "Audit Trail",
    financial: "Financial Model (BDT)",
    features: "Platform Features",
  },
  bn: {
    title: "উন্নয়নAI গবাদি পশু",
    subtitle: "স্মার্ট ডেয়ারি AI ও IoT প্ল্যাটফর্ম",
    live: "সক্রিয়",
    overview: "পরিচিতি",
    dashboards: "ড্যাশবোর্ড",
    iot: "IoT",
    analytics: "বিশ্লেষণ",
    governance: "শাসন",
    sdg: "SDG",
    services: "সেবাসমূহ",
    farmers: "কৃষক",
    totalCattle: "মোট পশু",
    dailyMilk: "দৈনিক দুধ",
    aiAlerts: "AI সতর্কতা",
    dataFlow: "ডেটা প্রবাহ স্তর",
    farmersInput: "SMS / ভয়েস ইনপুট",
    agentsInput: "এজেন্ট পোর্টাল ইনপুট",
    iotSensors: "পরিবেশগত ডেটা",
    validations: "বৈধতা",
    storage: "সংরক্ষণ",
    aiCore: "AI ও বিশ্লেষণ স্তর",
    riskMatrix: "ঝুঁকি ম্যাট্রিক্স",
    lowRisk: "কম ঝুঁকি",
    mediumRisk: "মাঝারি ঝুঁকি",
    highRisk: "উচ্চ ঝুঁকি",
    autoExecute: "স্বয়ংক্রিয়",
    humanReview: "মানব পর্যালোচনা",
    agentOverride: "এজেন্ট অতিক্রম",
    dashboard: "স্টেকহোল্ডার ড্যাশবোর্ড",
    iotEnv: "IoT ও পরিবেশগত স্তর",
    automation: "অটোমেশন নিয়ন্ত্রণ",
    predictions: "AI পূর্বাভাস",
    governanceSection: "শাসন ও সম্মতি",
    sdgSection: "SDG ও প্রভাব মেট্রিক্স",
    security: "নিরাপত্তা ও গোপনীয়তা",
    regulatory: "নিয়ন্ত্রক সমন্বয়",
    auditLog: "অডিট ট্রেইল",
    financial: "আর্থিক মডেল (BDT)",
    features: "প্ল্যাটফর্ম বৈশিষ্ট্য",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const t = translations[language];

  return (
    <div className="min-h-screen relative">
      {/* Eco Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Leaves Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🌿</div>
        <div className="absolute top-40 right-20 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '4s' }}>🍃</div>
        <div className="absolute bottom-40 left-1/4 text-2xl opacity-20 animate-bounce" style={{ animationDuration: '5s' }}>🌱</div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xs text-emerald-600/70">{t.subtitle}</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: "overview", label: t.overview },
                { id: "services", label: t.services },
                { id: "dashboards", label: t.dashboards },
                { id: "iot", label: t.iot },
                { id: "analytics", label: t.analytics },
                { id: "governance", label: t.governance },
                { id: "sdg", label: t.sdg },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.live}
              </span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as "en" | "bn")}
                className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: t.farmers, value: "12,450", change: "+12%", color: "emerald" },
                { label: t.totalCattle, value: "48,230", change: "+8%", color: "cyan" },
                { label: t.dailyMilk, value: "2.1M L", change: "+15%", color: "green" },
                { label: t.aiAlerts, value: "342", change: "-5%", color: "teal" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/15 transition-all duration-300">
                  <p className="text-emerald-600 text-sm font-medium">{stat.label}</p>
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <span className={`text-sm font-semibold text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Flow Layer */}
            <section className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                {t.dataFlow}
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { name: t.farmers, icon: "👨‍🌾", desc: t.farmersInput },
                  { name: "Agents", icon: "👤", desc: t.agentsInput },
                  { name: "IoT", icon: "📡", desc: t.iotSensors },
                ].map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl px-5 py-4">
                      <span className="text-3xl">{item.icon}</span>
                      <p className="text-gray-800 font-semibold mt-2">{item.name}</p>
                      <p className="text-emerald-600 text-xs">{item.desc}</p>
                    </div>
                    {i < 2 && <span className="text-emerald-300 text-2xl">→</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-emerald-50 rounded-xl px-4 py-2 text-sm">
                  <span className="text-emerald-600 font-medium">{t.validations}:</span> <span className="text-gray-600">Farmer ID, Cow ID, Date, Milk Yield</span>
                </div>
                <div className="bg-cyan-50 rounded-xl px-4 py-2 text-sm">
                  <span className="text-cyan-600 font-medium">{t.storage}:</span> <span className="text-gray-600">Relational DB + Data Warehouse</span>
                </div>
              </div>
            </section>

            {/* AI Core */}
            <section className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t.aiCore}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Farmer Agent", desc: "Fertility calendar, milk prediction, health alerts", color: "emerald" },
                  { name: "Agent Agent", desc: "Multi-farm monitoring, anomaly detection", color: "cyan" },
                  { name: "NGO/MFI Agent", desc: "District scoring, credit risk advisory", color: "green" },
                  { name: "Donor Agent", desc: "SDG metrics, funding risk scoring", color: "teal" },
                ].map((agent) => (
                  <div key={agent.name} className={`bg-gradient-to-br from-${agent.color}-50 to-${agent.color}-100/50 border border-${agent.color}-200 rounded-xl p-4 hover:shadow-lg hover:shadow-${agent.color}-500/20 transition-all duration-300`}>
                    <h3 className={`font-semibold text-${agent.color}-700`}>{agent.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{agent.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-gray-700">
                  <span className="text-emerald-600 font-semibold">Core AI Engine:</span> Rule-based safety + ML (LSTM, Random Forest) + LLM Explainability (Bangla/English)
                </p>
              </div>
            </section>

            {/* Risk Matrix */}
            <section className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t.riskMatrix}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-bold">{t.lowRisk}</p>
                  <p className="text-gray-800 text-2xl font-bold mt-2">{t.autoExecute}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-700 font-bold">{t.mediumRisk}</p>
                  <p className="text-gray-800 text-2xl font-bold mt-2">{t.humanReview}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-100 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-bold">{t.highRisk}</p>
                  <p className="text-gray-800 text-2xl font-bold mt-2">{t.agentOverride}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Services Section */}
        {activeTab === "services" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Milk Yield Prediction",
                    desc: "AI-powered daily and weekly milk production forecasts using LSTM neural networks",
                    icon: "🥛",
                    features: ["24-hour forecast", "Weekly trends", "Anomaly detection", "95% accuracy"],
                    color: "emerald"
                  },
                  {
                    title: "Fertility Management",
                    desc: "Smart fertility calendar with heat detection and breeding recommendations",
                    icon: "🐄",
                    features: ["Heat detection", "Breeding window", "Pregnancy tracking", "Success rate 78%"],
                    color: "green"
                  },
                  {
                    title: "Health Monitoring",
                    desc: "Real-time health alerts based on symptoms and IoT sensor data",
                    icon: "💊",
                    features: ["Early disease detection", "Symptom analysis", "Treatment suggestions", "Vet connectivity"],
                    color: "teal"
                  },
                  {
                    title: "Environmental Control",
                    desc: "IoT-based automated barn climate control with AI optimization",
                    icon: "🌡️",
                    features: ["Auto fan/fogger", "Temp optimization", "Ammonia alerts", "Energy savings"],
                    color: "cyan"
                  },
                  {
                    title: "Credit Advisory",
                    desc: "ML-powered credit risk assessment for NGO/MFI loan decisions",
                    icon: "💳",
                    features: ["Risk scoring", "Default prediction", "Loan sizing", "Repayment tracking"],
                    color: "green"
                  },
                  {
                    title: "Impact Analytics",
                    desc: "SDG-aligned impact measurement for donors and stakeholders",
                    icon: "📊",
                    features: ["SDG tracking", "Income growth", "Gender metrics", "Export reports"],
                    color: "emerald"
                  },
                ].map((service) => (
                  <div key={service.title} className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{service.icon}</span>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold text-${service.color}-700`}>{service.title}</h3>
                        <p className="text-gray-600 text-sm mt-2">{service.desc}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.features.map((f) => (
                        <span key={f} className={`text-xs bg-${service.color}-50 text-${service.color}-700 px-3 py-1.5 rounded-full font-medium`}>{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* API Services */}
            <section className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">API Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Farmer API", endpoints: "/api/farmers, /api/cattle, /api/milk", status: "Active" },
                  { name: "AI Prediction API", endpoints: "/api/predict/yield, /api/predict/fertility", status: "Active" },
                  { name: "IoT Data API", endpoints: "/api/iot/sensors, /api/iot/actuators", status: "Active" },
                  { name: "Audit API", endpoints: "/api/audit/logs, /api/audit/verify", status: "Active" },
                ].map((api) => (
                  <div key={api.name} className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-800 font-semibold">{api.name}</span>
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full font-medium">● {api.status}</span>
                    </div>
                    <p className="text-gray-500 text-xs font-mono">{api.endpoints}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Dashboards Section */}
        {activeTab === "dashboards" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t.dashboard}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Farmer Dashboard", icon: "👨‍🌾", desc: "Fertility calendar, health alerts, milk trends, SMS alerts", features: ["My Cows", "Milk Log", "Alerts", "Weather"], color: "emerald" },
                  { name: "Agent Dashboard", icon: "👤", desc: "Farm cluster monitoring, anomaly review, manual overrides", features: ["My Farms", "Anomalies", "Escalations", "Reports"], color: "green" },
                  { name: "NGO/MFI Dashboard", icon: "🏢", desc: "District scoring, credit recommendations, environmental", features: ["Districts", "Credit Score", "Loans", "Impact"], color: "cyan" },
                  { name: "Donor Dashboard", icon: "💰", desc: "SDG KPIs, impact reports, anomaly alerts", features: ["SDG Goals", "Donations", "Reports", "Alerts"], color: "teal" },
                ].map((dashboard) => (
                  <button
                    key={dashboard.name}
                    className={`bg-white/70 backdrop-blur-sm border border-${dashboard.color}-100 hover:border-${dashboard.color}-300 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-${dashboard.color}-500/15 hover:-translate-y-1`}
                  >
                    <span className="text-4xl">{dashboard.icon}</span>
                    <h3 className={`text-lg font-semibold text-${dashboard.color}-700 mt-4`}>{dashboard.name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{dashboard.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dashboard.features.map((f) => (
                        <span key={f} className={`text-xs bg-${dashboard.color}-50 text-${dashboard.color}-700 px-2 py-1 rounded-lg font-medium`}>{f}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-600">156</p>
                  <p className="text-gray-600 text-sm">Districts Covered</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl">
                  <p className="text-3xl font-bold text-cyan-600">2,340</p>
                  <p className="text-gray-600 text-sm">Active Agents</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">48</p>
                  <p className="text-gray-600 text-sm">Partner NGOs</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl">
                  <p className="text-3xl font-bold text-amber-600">12</p>
                  <p className="text-gray-600 text-sm">Donor Partners</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* IoT Section */}
        {activeTab === "iot" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                {t.iotEnv}
              </h2>
              
              {/* Sensor Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { name: "Temperature", value: "24.5°C", ideal: "18-25°C", status: "normal", icon: "🌡️", threshold: "30°C" },
                  { name: "Humidity", value: "65%", ideal: "50-70%", status: "normal", icon: "💧", threshold: "80%" },
                  { name: "Ammonia", value: "12 ppm", ideal: "<25 ppm", status: "normal", icon: "🧪", threshold: "25 ppm" },
                  { name: "CO₂", value: "420 ppm", ideal: "<1000 ppm", status: "normal", icon: "💨", threshold: "1000 ppm" },
                  { name: "VOC", value: "0.08", ideal: "<0.5", status: "normal", icon: "🔬", threshold: "0.5" },
                  { name: "Noise", value: "65 dB", ideal: "<70 dB", status: "normal", icon: "🔊", threshold: "70 dB" },
                ].map((sensor) => (
                  <div key={sensor.name} className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-xl p-4 text-center hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-300">
                    <span className="text-2xl">{sensor.icon}</span>
                    <p className="text-gray-800 font-bold mt-2">{sensor.value}</p>
                    <p className="text-emerald-600 text-xs">{sensor.name}</p>
                    <p className="text-emerald-500 text-xs mt-1">Ideal: {sensor.ideal}</p>
                    <div className="mt-2">
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full flex items-center justify-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Automation Control */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.automation}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Barn Fans", status: "auto", active: true, lastAction: "2 min ago" },
                    { name: "Foggers", status: "auto", active: false, lastAction: "15 min ago" },
                    { name: "Lighting", status: "manual", active: true, lastAction: "1 hr ago" },
                  ].map((device) => (
                    <div key={device.name} className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-800 font-medium">{device.name}</span>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{device.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last: {device.lastAction}</span>
                        <div className={`w-12 h-6 rounded-full p-1 ${device.active ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${device.active ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* IoT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 border border-emerald-200 rounded-2xl p-6">
                <p className="text-emerald-700 text-sm font-medium">Active Sensors</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">8,450</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200 rounded-2xl p-6">
                <p className="text-cyan-700 text-sm font-medium">Data Points/min</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">1.2M</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl p-6">
                <p className="text-green-700 text-sm font-medium">Automation Actions</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">45,230</p>
              </div>
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-200 rounded-2xl p-6">
                <p className="text-teal-700 text-sm font-medium">IoT Farms</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">234</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t.predictions}
              </h2>
              
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Milk Yield Prediction</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Today", value: "2.1M L", accuracy: "98%", confidence: "high" },
                      { label: "Tomorrow", value: "2.15M L", accuracy: "95%", confidence: "high" },
                      { label: "This Week", value: "14.8M L", accuracy: "92%", confidence: "medium" },
                      { label: "This Month", value: "63.2M L", accuracy: "88%", confidence: "medium" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100">
                        <span className="text-gray-700">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-gray-800 font-bold">{pred.value}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-emerald-600">{pred.accuracy}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              pred.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>{pred.confidence}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Fertility Predictions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Heat Detection Ready", value: "342 cows", status: "ready", action: "Breed now" },
                      { label: "Due in 7 days", value: "89 cows", status: "upcoming", action: "Prepare" },
                      { label: "Success Rate", value: "78%", status: "good", action: "Track" },
                      { label: "Avg. Days Open", value: "85 days", status: "target: 60", action: "Improve" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <span className="text-gray-700">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-gray-800 font-bold">{pred.value}</p>
                          <p className="text-xs text-cyan-600">{pred.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ML Model Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { model: "LSTM", metric: "p95 Latency", value: "<100ms", type: "Time-series" },
                    { model: "Random Forest", metric: "Precision", value: "94.2%", type: "Classification" },
                    { model: "Gradient Boost", metric: "Recall", value: "91.8%", type: "Classification" },
                    { model: "LLM Explainability", metric: "F1 Score", value: "89.5%", type: "NLP" },
                  ].map((m) => (
                    <div key={m.model} className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-emerald-600 text-xs font-medium">{m.model}</p>
                      <p className="text-gray-800 font-bold text-xl">{m.value}</p>
                      <p className="text-green-600 text-xs">{m.metric}</p>
                      <p className="text-gray-500 text-xs mt-1">{m.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 rounded-2xl p-6">
                  <h4 className="text-blue-700 font-medium mb-2">Disease Prediction</h4>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                  <p className="text-gray-600 text-sm">High-risk cases this week</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200 rounded-2xl p-6">
                  <h4 className="text-purple-700 font-medium mb-2">Feed Optimization</h4>
                  <p className="text-2xl font-bold text-gray-800">-15%</p>
                  <p className="text-gray-600 text-sm">Cost reduction with AI</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-green-100 border border-cyan-200 rounded-2xl p-6">
                  <h4 className="text-cyan-700 font-medium mb-2">Yield Insights</h4>
                  <p className="text-2xl font-bold text-gray-800">+23%</p>
                  <p className="text-gray-600 text-sm">Average increase vs traditional</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Governance Section */}
        {activeTab === "governance" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                {t.governanceSection}
              </h2>

              {/* Compliance Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.security}</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Data Encryption", status: "AES-256 at rest", active: true, verified: "2024-01" },
                      { name: "Transport Security", status: "TLS 1.3", active: true, verified: "2024-01" },
                      { name: "Anonymization", status: "Active", active: true, verified: "2024-01" },
                      { name: "Consent Tracking", status: "12,450 farmers", active: true, verified: "2024-01" },
                      { name: "Data Retention", status: "7 years", active: true, verified: "2024-01" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100">
                        <div>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <p className="text-gray-500 text-xs">{item.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{item.verified}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.regulatory}</h3>
                  <div className="space-y-3">
                    {[
                      { name: "NGO Affairs Bureau", status: "Compliant", law: "NGO Affairs Act" },
                      { name: "MRA (Microcredit)", status: "Compliant", law: "MRA Act 2006" },
                      { name: "NBR (Tax)", status: "Compliant", law: "Income Tax Act" },
                      { name: "Digital Security", status: "Compliant", law: "Digital Security Act" },
                      { name: "Data Protection", status: "Compliant", law: "Draft Data Protection Act" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div>
                          <span className="text-gray-800 font-medium">{item.name}</span>
                          <p className="text-gray-500 text-xs">{item.law}</p>
                        </div>
                        <span className="text-emerald-600 text-sm bg-emerald-100 px-3 py-1 rounded-full font-medium">✓ {item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Log */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.auditLog}</h3>
                <div className="space-y-2">
                  {[
                    { action: "AI Decision", detail: "Low risk milk prediction approved", time: "2 min ago", hash: "a7f3..." },
                    { action: "Human Override", detail: "Agent reviewed medium-risk alert", time: "15 min ago", hash: "b8e2..." },
                    { action: "Data Access", detail: "NGO accessed district metrics", time: "1 hr ago", hash: "c9d1..." },
                    { action: "System Action", detail: "Automated barn cooling activated", time: "2 hr ago", hash: "d0e4..." },
                    { action: "Data Entry", detail: "Agent logged new cow data", time: "3 hr ago", hash: "e1f5..." },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-emerald-600">{log.hash}</span>
                        <div>
                          <p className="text-gray-800 font-medium">{log.action}</p>
                          <p className="text-gray-600 text-sm">{log.detail}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Ethics Board */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Ethics Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4">
                    <p className="text-emerald-600 text-sm">Quarterly Reviews</p>
                    <p className="text-gray-800 font-bold text-xl mt-1">4/year</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-4">
                    <p className="text-cyan-600 text-sm">Bias Audits</p>
                    <p className="text-gray-800 font-bold text-xl mt-1">Monthly</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
                    <p className="text-purple-600 text-sm">Risk Assessments</p>
                    <p className="text-gray-800 font-bold text-xl mt-1">Continuous</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SDG Section */}
        {activeTab === "sdg" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                {t.sdgSection}
              </h2>

              {/* SDG Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { goal: "No Poverty", target: "Farmer Income Growth", current: "+23%", targetVal: "30%", sdg: "SDG 1", icon: "🏚️" },
                  { goal: "Zero Hunger", target: "Milk Yield Increase", current: "+15%", targetVal: "20%", sdg: "SDG 2", icon: "🍽️" },
                  { goal: "Gender Equality", target: "Female Farmers", current: "42%", targetVal: "50%", sdg: "SDG 5", icon: "⚖️" },
                  { goal: "Decent Work", target: "Agent Employment", current: "2,340", targetVal: "5,000", sdg: "SDG 8", icon: "💼" },
                  { goal: "Climate Action", target: "Emissions Reduced", current: "-18%", targetVal: "-25%", sdg: "SDG 13", icon: "🌍" },
                  { goal: "Partnerships", target: "NGO Partners", current: "48", targetVal: "100", sdg: "SDG 17", icon: "🤝" },
                ].map((sdg) => (
                  <div key={sdg.sdg} className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sdg.icon}</span>
                        <span className="text-emerald-600 font-bold text-sm">{sdg.sdg}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{sdg.goal}</span>
                    </div>
                    <p className="text-gray-800 font-medium">{sdg.target}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-emerald-600 font-semibold">{sdg.current}</span>
                        <span className="text-gray-500">Target: {sdg.targetVal}</span>
                      </div>
                      <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-cyan-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.financial}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                    <p className="text-emerald-700 text-sm">Farmer Subscription</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">FREE</p>
                    <p className="text-gray-500 text-xs">Always</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl">
                    <p className="text-cyan-700 text-sm">NGO District License</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">300K-550K</p>
                    <p className="text-gray-500 text-xs">/year</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                    <p className="text-purple-700 text-sm">MFI Credit Advisory</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">200</p>
                    <p className="text-gray-500 text-xs">/loan</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                    <p className="text-amber-700 text-sm">IoT Premium Farm</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">25K-50K+</p>
                    <p className="text-gray-500 text-xs">setup + 2K/mo</p>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-200 to-green-200 border border-emerald-300 rounded-2xl p-6 text-center">
                  <p className="text-emerald-800 text-sm">Total Farmers Impacted</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">12,450+</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-200 to-teal-200 border border-cyan-300 rounded-2xl p-6 text-center">
                  <p className="text-cyan-800 text-sm">Income Increase</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">+23%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-200 to-violet-200 border border-purple-300 rounded-2xl p-6 text-center">
                  <p className="text-purple-800 text-sm">Loans Disbursed</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">BDT 45M</p>
                </div>
                <div className="bg-gradient-to-br from-amber-200 to-yellow-200 border border-amber-300 rounded-2xl p-6 text-center">
                  <p className="text-amber-800 text-sm">CO₂ Reduced</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">-18%</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-emerald-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-emerald-700 font-medium">{t.title}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-600">
              <span>Phase 1 Ready</span>
              <span>•</span>
              <span>Kubernetes Deployed</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.live}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
