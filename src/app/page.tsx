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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t.title}</h1>
                <p className="text-xs text-neutral-400">{t.subtitle}</p>
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {t.live}
              </span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as "en" | "bn")}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: t.farmers, value: "12,450", change: "+12%", color: "emerald" },
                { label: t.totalCattle, value: "48,230", change: "+8%", color: "cyan" },
                { label: t.dailyMilk, value: "2.1M L", change: "+15%", color: "blue" },
                { label: t.aiAlerts, value: "342", change: "-5%", color: "amber" },
              ].map((stat) => (
                <div key={stat.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <p className="text-neutral-400 text-sm">{stat.label}</p>
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <span className={`text-sm font-medium text-${stat.color}-400`}>{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Flow Layer */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                {t.dataFlow}
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { name: t.farmers, icon: "👨‍🌾", desc: t.farmersInput },
                  { name: "Agents", icon: "👤", desc: t.agentsInput },
                  { name: "IoT", icon: "📡", desc: t.iotSensors },
                ].map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-white font-medium mt-1">{item.name}</p>
                      <p className="text-neutral-400 text-xs">{item.desc}</p>
                    </div>
                    {i < 2 && <span className="text-neutral-600 text-2xl">→</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-neutral-800 rounded-lg px-4 py-2 text-sm">
                  <span className="text-neutral-400">{t.validations}:</span> Farmer ID, Cow ID, Date, Milk Yield
                </div>
                <div className="bg-neutral-800 rounded-lg px-4 py-2 text-sm">
                  <span className="text-neutral-400">{t.storage}:</span> Relational DB + Data Warehouse
                </div>
              </div>
            </section>

            {/* AI Core */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t.aiCore}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Farmer Agent", desc: "Fertility calendar, milk prediction, health alerts", color: "green" },
                  { name: "Agent Agent", desc: "Multi-farm monitoring, anomaly detection", color: "cyan" },
                  { name: "NGO/MFI Agent", desc: "District scoring, credit risk advisory", color: "purple" },
                  { name: "Donor Agent", desc: "SDG metrics, funding risk scoring", color: "amber" },
                ].map((agent) => (
                  <div key={agent.name} className={`bg-${agent.color}-500/10 border border-${agent.color}-500/20 rounded-xl p-4`}>
                    <h3 className={`font-semibold text-${agent.color}-400`}>{agent.name}</h3>
                    <p className="text-neutral-400 text-sm mt-1">{agent.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-300">
                  <span className="text-green-400 font-medium">Core AI Engine:</span> Rule-based safety + ML (LSTM, Random Forest) + LLM Explainability (Bangla/English)
                </p>
              </div>
            </section>

            {/* Risk Matrix */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t.riskMatrix}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-bold">{t.lowRisk}</p>
                  <p className="text-white text-2xl font-bold mt-2">{t.autoExecute}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                  <p className="text-amber-400 font-bold">{t.mediumRisk}</p>
                  <p className="text-white text-2xl font-bold mt-2">{t.humanReview}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-red-400 font-bold">{t.highRisk}</p>
                  <p className="text-white text-2xl font-bold mt-2">{t.agentOverride}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Services Section */}
        {activeTab === "services" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Platform Services</h2>
              
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
                    color: "cyan"
                  },
                  {
                    title: "Health Monitoring",
                    desc: "Real-time health alerts based on symptoms and IoT sensor data",
                    icon: "💊",
                    features: ["Early disease detection", "Symptom analysis", "Treatment suggestions", "Vet connectivity"],
                    color: "red"
                  },
                  {
                    title: "Environmental Control",
                    desc: "IoT-based automated barn climate control with AI optimization",
                    icon: "🌡️",
                    features: ["Auto fan/fogger", "Temp optimization", "Ammonia alerts", "Energy savings"],
                    color: "orange"
                  },
                  {
                    title: "Credit Advisory",
                    desc: "ML-powered credit risk assessment for NGO/MFI loan decisions",
                    icon: "💳",
                    features: ["Risk scoring", "Default prediction", "Loan sizing", "Repayment tracking"],
                    color: "purple"
                  },
                  {
                    title: "Impact Analytics",
                    desc: "SDG-aligned impact measurement for donors and stakeholders",
                    icon: "📊",
                    features: ["SDG tracking", "Income growth", "Gender metrics", "Export reports"],
                    color: "amber"
                  },
                ].map((service) => (
                  <div key={service.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{service.icon}</span>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold text-${service.color}-400`}>{service.title}</h3>
                        <p className="text-neutral-400 text-sm mt-2">{service.desc}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.features.map((f) => (
                        <span key={f} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* API Services */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">API Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Farmer API", endpoints: "/api/farmers, /api/cattle, /api/milk", status: "Active" },
                  { name: "AI Prediction API", endpoints: "/api/predict/yield, /api/predict/fertility", status: "Active" },
                  { name: "IoT Data API", endpoints: "/api/iot/sensors, /api/iot/actuators", status: "Active" },
                  { name: "Audit API", endpoints: "/api/audit/logs, /api/audit/verify", status: "Active" },
                ].map((api) => (
                  <div key={api.name} className="bg-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{api.name}</span>
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">● {api.status}</span>
                    </div>
                    <p className="text-neutral-400 text-xs font-mono">{api.endpoints}</p>
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
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                {t.dashboard}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Farmer Dashboard", icon: "👨‍🌾", desc: "Fertility calendar, health alerts, milk trends, SMS alerts", features: ["My Cows", "Milk Log", "Alerts", "Weather"], color: "emerald" },
                  { name: "Agent Dashboard", icon: "👤", desc: "Farm cluster monitoring, anomaly review, manual overrides", features: ["My Farms", "Anomalies", "Escalations", "Reports"], color: "cyan" },
                  { name: "NGO/MFI Dashboard", icon: "🏢", desc: "District scoring, credit recommendations, environmental", features: ["Districts", "Credit Score", "Loans", "Impact"], color: "purple" },
                  { name: "Donor Dashboard", icon: "💰", desc: "SDG KPIs, impact reports, anomaly alerts", features: ["SDG Goals", "Donations", "Reports", "Alerts"], color: "amber" },
                ].map((dashboard) => (
                  <button
                    key={dashboard.name}
                    className={`bg-neutral-900 border border-neutral-800 hover:border-${dashboard.color}-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]`}
                  >
                    <span className="text-4xl">{dashboard.icon}</span>
                    <h3 className={`text-lg font-semibold text-${dashboard.color}-400 mt-4`}>{dashboard.name}</h3>
                    <p className="text-neutral-400 text-sm mt-2">{dashboard.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dashboard.features.map((f) => (
                        <span key={f} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded">{f}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">156</p>
                  <p className="text-neutral-400 text-sm">Districts Covered</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <p className="text-3xl font-bold text-cyan-400">2,340</p>
                  <p className="text-neutral-400 text-sm">Active Agents</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <p className="text-3xl font-bold text-purple-400">48</p>
                  <p className="text-neutral-400 text-sm">Partner NGOs</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">12</p>
                  <p className="text-neutral-400 text-sm">Donor Partners</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* IoT Section */}
        {activeTab === "iot" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
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
                  <div key={sensor.name} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                    <span className="text-2xl">{sensor.icon}</span>
                    <p className="text-white font-semibold mt-2">{sensor.value}</p>
                    <p className="text-neutral-400 text-xs">{sensor.name}</p>
                    <p className="text-emerald-400 text-xs mt-1">Ideal: {sensor.ideal}</p>
                    <div className="mt-2">
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Automation Control */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t.automation}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Barn Fans", status: "auto", active: true, lastAction: "2 min ago" },
                    { name: "Foggers", status: "auto", active: false, lastAction: "15 min ago" },
                    { name: "Lighting", status: "manual", active: true, lastAction: "1 hr ago" },
                  ].map((device) => (
                    <div key={device.name} className="bg-neutral-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{device.name}</span>
                        <span className="text-xs text-neutral-400">{device.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Last: {device.lastAction}</span>
                        <div className={`w-12 h-6 rounded-full p-1 ${device.active ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${device.active ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* IoT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="text-orange-400 text-sm">Active Sensors</p>
                <p className="text-3xl font-bold text-white mt-2">8,450</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="text-orange-400 text-sm">Data Points/min</p>
                <p className="text-3xl font-bold text-white mt-2">1.2M</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="text-orange-400 text-sm">Automation Actions</p>
                <p className="text-3xl font-bold text-white mt-2">45,230</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="text-orange-400 text-sm">IoT Farms</p>
                <p className="text-3xl font-bold text-white mt-2">234</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t.predictions}
              </h2>
              
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Milk Yield Prediction</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Today", value: "2.1M L", accuracy: "98%", confidence: "high" },
                      { label: "Tomorrow", value: "2.15M L", accuracy: "95%", confidence: "high" },
                      { label: "This Week", value: "14.8M L", accuracy: "92%", confidence: "medium" },
                      { label: "This Month", value: "63.2M L", accuracy: "88%", confidence: "medium" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <span className="text-neutral-300">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{pred.value}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-green-400">{pred.accuracy}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              pred.confidence === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>{pred.confidence}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fertility Predictions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Heat Detection Ready", value: "342 cows", status: "ready", action: "Breed now" },
                      { label: "Due in 7 days", value: "89 cows", status: "upcoming", action: "Prepare" },
                      { label: "Success Rate", value: "78%", status: "good", action: "Track" },
                      { label: "Avg. Days Open", value: "85 days", status: "target: 60", action: "Improve" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <span className="text-neutral-300">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{pred.value}</p>
                          <p className="text-xs text-cyan-400">{pred.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">ML Model Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { model: "LSTM", metric: "p95 Latency", value: "<100ms", type: "Time-series" },
                    { model: "Random Forest", metric: "Precision", value: "94.2%", type: "Classification" },
                    { model: "Gradient Boost", metric: "Recall", value: "91.8%", type: "Classification" },
                    { model: "LLM Explainability", metric: "F1 Score", value: "89.5%", type: "NLP" },
                  ].map((m) => (
                    <div key={m.model} className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-xs">{m.model}</p>
                      <p className="text-white font-bold text-lg">{m.value}</p>
                      <p className="text-green-400 text-xs">{m.metric}</p>
                      <p className="text-neutral-500 text-xs mt-1">{m.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-blue-400 font-medium mb-2">Disease Prediction</h4>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-neutral-400 text-sm">High-risk cases this week</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-purple-400 font-medium mb-2">Feed Optimization</h4>
                  <p className="text-2xl font-bold text-white">-15%</p>
                  <p className="text-neutral-400 text-sm">Cost reduction with AI</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <h4 className="text-cyan-400 font-medium mb-2">Yield Insights</h4>
                  <p className="text-2xl font-bold text-white">+23%</p>
                  <p className="text-neutral-400 text-sm">Average increase vs traditional</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Governance Section */}
        {activeTab === "governance" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                {t.governanceSection}
              </h2>

              {/* Compliance Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t.security}</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Data Encryption", status: "AES-256 at rest", active: true, verified: "2024-01" },
                      { name: "Transport Security", status: "TLS 1.3", active: true, verified: "2024-01" },
                      { name: "Anonymization", status: "Active", active: true, verified: "2024-01" },
                      { name: "Consent Tracking", status: "12,450 farmers", active: true, verified: "2024-01" },
                      { name: "Data Retention", status: "7 years", active: true, verified: "2024-01" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div>
                          <span className="text-neutral-300">{item.name}</span>
                          <p className="text-neutral-500 text-xs">{item.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500 text-xs">{item.verified}</span>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t.regulatory}</h3>
                  <div className="space-y-4">
                    {[
                      { name: "NGO Affairs Bureau", status: "Compliant", law: "NGO Affairs Act" },
                      { name: "MRA (Microcredit)", status: "Compliant", law: "MRA Act 2006" },
                      { name: "NBR (Tax)", status: "Compliant", law: "Income Tax Act" },
                      { name: "Digital Security", status: "Compliant", law: "Digital Security Act" },
                      { name: "Data Protection", status: "Compliant", law: "Draft Data Protection Act" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{item.name}</span>
                          <p className="text-neutral-500 text-xs">{item.law}</p>
                        </div>
                        <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">✓ {item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Log */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">{t.auditLog}</h3>
                <div className="space-y-2">
                  {[
                    { action: "AI Decision", detail: "Low risk milk prediction approved", time: "2 min ago", hash: "a7f3..." },
                    { action: "Human Override", detail: "Agent reviewed medium-risk alert", time: "15 min ago", hash: "b8e2..." },
                    { action: "Data Access", detail: "NGO accessed district metrics", time: "1 hr ago", hash: "c9d1..." },
                    { action: "System Action", detail: "Automated barn cooling activated", time: "2 hr ago", hash: "d0e4..." },
                    { action: "Data Entry", detail: "Agent logged new cow data", time: "3 hr ago", hash: "e1f5..." },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-neutral-500">{log.hash}</span>
                        <div>
                          <p className="text-white font-medium">{log.action}</p>
                          <p className="text-neutral-400 text-sm">{log.detail}</p>
                        </div>
                      </div>
                      <span className="text-neutral-500 text-sm">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Ethics Board */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Ethics Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-400 text-sm">Quarterly Reviews</p>
                    <p className="text-white font-bold text-xl mt-1">4/year</p>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-400 text-sm">Bias Audits</p>
                    <p className="text-white font-bold text-xl mt-1">Monthly</p>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-400 text-sm">Risk Assessments</p>
                    <p className="text-white font-bold text-xl mt-1">Continuous</p>
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
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
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
                  <div key={sdg.sdg} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sdg.icon}</span>
                        <span className="text-amber-400 font-bold text-sm">{sdg.sdg}</span>
                      </div>
                      <span className="text-neutral-500 text-xs">{sdg.goal}</span>
                    </div>
                    <p className="text-white font-medium">{sdg.target}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-400">{sdg.current}</span>
                        <span className="text-neutral-400">Target: {sdg.targetVal}</span>
                      </div>
                      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">{t.financial}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                    <p className="text-emerald-400 text-sm">Farmer Subscription</p>
                    <p className="text-2xl font-bold text-white mt-2">FREE</p>
                    <p className="text-neutral-400 text-xs">Always</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                    <p className="text-cyan-400 text-sm">NGO District License</p>
                    <p className="text-2xl font-bold text-white mt-2">300K-550K</p>
                    <p className="text-neutral-400 text-xs">/year</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <p className="text-purple-400 text-sm">MFI Credit Advisory</p>
                    <p className="text-2xl font-bold text-white mt-2">200</p>
                    <p className="text-neutral-400 text-xs">/loan</p>
                  </div>
                  <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                    <p className="text-amber-400 text-sm">IoT Premium Farm</p>
                    <p className="text-2xl font-bold text-white mt-2">25K-50K+</p>
                    <p className="text-neutral-400 text-xs">setup + 2K/mo</p>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                  <p className="text-emerald-400 text-sm">Total Farmers Impacted</p>
                  <p className="text-3xl font-bold text-white mt-2">12,450+</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                  <p className="text-cyan-400 text-sm">Income Increase</p>
                  <p className="text-3xl font-bold text-white mt-2">+23%</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                  <p className="text-purple-400 text-sm">Loans Disbursed</p>
                  <p className="text-3xl font-bold text-white mt-2">BDT 45M</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
                  <p className="text-amber-400 text-sm">CO₂ Reduced</p>
                  <p className="text-3xl font-bold text-white mt-2">-18%</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-neutral-400">{t.title}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <span>Phase 1 Ready</span>
              <span>•</span>
              <span>Kubernetes Deployed</span>
              <span>•</span>
              <span className="text-emerald-400">● {t.live}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
