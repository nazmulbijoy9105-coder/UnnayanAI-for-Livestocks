"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

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
                <h1 className="text-xl font-bold text-white">UnnayanAI</h1>
                <p className="text-xs text-neutral-400">Smart Dairy & Livestock Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {["overview", "dashboards", "iot", "analytics", "governance", "sdg"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                ● Live
              </span>
              <select className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white">
                <option>English</option>
                <option>বাংলা</option>
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
                { label: "Active Farmers", value: "12,450", change: "+12%", color: "emerald" },
                { label: "Total Cattle", value: "48,230", change: "+8%", color: "cyan" },
                { label: "Daily Milk (L)", value: "2.1M", change: "+15%", color: "blue" },
                { label: "AI Alerts", value: "342", change: "-5%", color: "amber" },
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
                Data Flow Layer
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { name: "Farmers", icon: "👨‍🌾", desc: "SMS / Voice Input" },
                  { name: "Agents", icon: "👤", desc: "Portal Input" },
                  { name: "IoT Sensors", icon: "📡", desc: "Environmental Data" },
                ].map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-white font-medium mt-1">{item.name}</p>
                      <p className="text-neutral-400 text-xs">{item.desc}</p>
                    </div>
                    {i < 2 && <span className="text-neutral-600">→</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4">
                <div className="bg-neutral-800 rounded-lg px-4 py-2 text-sm">
                  <span className="text-neutral-400">Validations:</span> Farmer ID, Cow ID, Date, Milk Yield
                </div>
                <div className="bg-neutral-800 rounded-lg px-4 py-2 text-sm">
                  <span className="text-neutral-400">Storage:</span> Relational DB + Data Warehouse (Star Schema)
                </div>
              </div>
            </section>

            {/* AI Core */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                AI & Analytics Layer
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
                  <span className="text-green-400 font-medium">Core AI Engine:</span> Rule-based safety thresholds + ML predictive models (LSTM, Random Forest) + LLM Explainability (Bangla/English)
                </p>
              </div>
            </section>

            {/* Risk Matrix */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Risk Scoring Matrix</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-bold">Low Risk</p>
                  <p className="text-white text-2xl font-bold mt-2">Auto-execute</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                  <p className="text-amber-400 font-bold">Medium Risk</p>
                  <p className="text-white text-2xl font-bold mt-2">Human review</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-red-400 font-bold">High Risk</p>
                  <p className="text-white text-2xl font-bold mt-2">Agent override</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Dashboards Section */}
        {activeTab === "dashboards" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Stakeholder Dashboards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Farmer Dashboard", icon: "👨‍🌾", desc: "Fertility calendar, health alerts, milk trends", color: "emerald" },
                  { name: "Agent Dashboard", icon: "👤", desc: "Farm cluster monitoring, anomaly review", color: "cyan" },
                  { name: "NGO/MFI Dashboard", icon: "🏢", desc: "District scoring, credit recommendations", color: "purple" },
                  { name: "Donor Dashboard", icon: "💰", desc: "SDG KPIs, impact reports, anomaly alerts", color: "amber" },
                ].map((dashboard) => (
                  <button
                    key={dashboard.name}
                    className={`bg-neutral-900 border border-neutral-800 hover:border-${dashboard.color}-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02]`}
                  >
                    <span className="text-4xl">{dashboard.icon}</span>
                    <h3 className={`text-lg font-semibold text-${dashboard.color}-400 mt-4`}>{dashboard.name}</h3>
                    <p className="text-neutral-400 text-sm mt-2">{dashboard.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-white">
                      <span>Open Dashboard</span>
                      <span>→</span>
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
                IoT & Environmental Layer
              </h2>
              
              {/* Sensor Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { name: "Temperature", value: "24.5°C", status: "normal", icon: "🌡️" },
                  { name: "Humidity", value: "65%", status: "normal", icon: "💧" },
                  { name: "Ammonia", value: "12 ppm", status: "normal", icon: "🧪" },
                  { name: "CO₂", value: "420 ppm", status: "normal", icon: "💨" },
                  { name: "VOC", value: "0.08", status: "normal", icon: "🔬" },
                  { name: "Noise", value: "65 dB", status: "normal", icon: "🔊" },
                ].map((sensor) => (
                  <div key={sensor.name} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                    <span className="text-2xl">{sensor.icon}</span>
                    <p className="text-white font-semibold mt-2">{sensor.value}</p>
                    <p className="text-neutral-400 text-xs">{sensor.name}</p>
                    <span className="inline-block mt-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">● Normal</span>
                  </div>
                ))}
              </div>

              {/* Automation Control */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Automation Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Barn Fans", status: "auto", active: true },
                    { name: "Foggers", status: "auto", active: false },
                    { name: "Lighting", status: "manual", active: true },
                  ].map((device) => (
                    <div key={device.name} className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{device.name}</p>
                        <p className="text-neutral-400 text-xs">{device.status}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 ${device.active ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${device.active ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* IoT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="text-orange-400 text-sm">Active Sensors</p>
                <p className="text-3xl font-bold text-white mt-2">8,450</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="orange-400 text-sm">Data Points/min</p>
                <p className="text-3xl font-bold text-white mt-2">1.2M</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="orange-400 text-sm">Automation Actions</p>
                <p className="text-3xl font-bold text-white mt-2">45,230</p>
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
                AI Predictions & Analytics
              </h2>
              
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Milk Yield Prediction</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Today", value: "2.1M L", accuracy: "98%" },
                      { label: "Tomorrow", value: "2.15M L", accuracy: "95%" },
                      { label: "This Week", value: "14.8M L", accuracy: "92%" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <span className="text-neutral-300">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{pred.value}</p>
                          <p className="text-xs text-green-400">{pred.accuracy} accuracy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fertility Predictions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Heat Detection", value: "342 cows", status: "ready" },
                      { label: "Due in 7 days", value: "89 cows", status: "upcoming" },
                      { label: "Success Rate", value: "78%", status: "good" },
                    ].map((pred) => (
                      <div key={pred.label} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <span className="text-neutral-300">{pred.label}</span>
                        <div className="text-right">
                          <p className="text-white font-semibold">{pred.value}</p>
                          <p className="text-xs text-cyan-400">{pred.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">ML Model Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { model: "LSTM", metric: "p95 Latency", value: "<100ms" },
                    { model: "Random Forest", metric: "Precision", value: "94.2%" },
                    { model: "Gradient Boost", metric: "Recall", value: "91.8%" },
                    { model: "LLM Explainability", metric: "F1 Score", value: "89.5%" },
                  ].map((m) => (
                    <div key={m.model} className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-xs">{m.model}</p>
                      <p className="text-white font-bold text-lg">{m.value}</p>
                      <p className="text-green-400 text-xs">{m.metric}</p>
                    </div>
                  ))}
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
                Governance & Compliance
              </h2>

              {/* Compliance Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Security & Privacy</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Data Encryption", status: "AES-256 at rest", active: true },
                      { name: "Transport Security", status: "TLS 1.3", active: true },
                      { name: "Anonymization", status: "Active", active: true },
                      { name: "Consent Tracking", status: "12,450 farmers", active: true },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-neutral-300">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 text-sm">{item.status}</span>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Regulatory Alignment</h3>
                  <div className="space-y-4">
                    {[
                      { name: "NGO Affairs Bureau", status: "Compliant" },
                      { name: "MRA (Microcredit)", status: "Compliant" },
                      { name: "NBR (Tax)", status: "Compliant" },
                      { name: "Data Protection", status: "Compliant" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-neutral-300">{item.name}</span>
                        <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">✓ {item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Log */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Audit Trail</h3>
                <div className="space-y-2">
                  {[
                    { action: "AI Decision", detail: "Low risk milk prediction approved", time: "2 min ago" },
                    { action: "Human Override", detail: "Agent reviewed medium-risk alert", time: "15 min ago" },
                    { action: "Data Access", detail: "NGO accessed district metrics", time: "1 hr ago" },
                    { action: "System Action", detail: "Automated barn cooling activated", time: "2 hr ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-neutral-400 text-sm">{log.detail}</p>
                      </div>
                      <span className="text-neutral-500 text-sm">{log.time}</span>
                    </div>
                  ))}
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
                SDG & Impact Metrics
              </h2>

              {/* SDG Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { goal: "No Poverty", target: "Farmer Income Growth", current: "+23%", targetVal: "30%", sdg: "SDG 1" },
                  { goal: "Zero Hunger", target: "Milk Yield Increase", current: "+15%", targetVal: "20%", sdg: "SDG 2" },
                  { goal: "Gender Equality", target: "Female Farmers", current: "42%", targetVal: "50%", sdg: "SDG 5" },
                  { goal: "Decent Work", target: "Agent Employment", current: "2,340", targetVal: "5,000", sdg: "SDG 8" },
                  { goal: "Climate Action", target: "Emissions Reduced", current: "-18%", targetVal: "-25%", sdg: "SDG 13" },
                  { goal: "Partnerships", target: "NGO Partners", current: "48", targetVal: "100", sdg: "SDG 17" },
                ].map((sdg) => (
                  <div key={sdg.sdg} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-amber-400 font-bold text-sm">{sdg.sdg}</span>
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Model (BDT)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                    <p className="text-emerald-400 text-sm">Farmer Subscription</p>
                    <p className="text-2xl font-bold text-white mt-2">FREE</p>
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
              <span className="text-neutral-400">UnnayanAI for Livestocks</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <span>Phase 1 Ready</span>
              <span>•</span>
              <span>Kubernetes Deployed</span>
              <span>•</span>
              <span className="text-emerald-400">● Live System</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
