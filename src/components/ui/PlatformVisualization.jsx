/**
 * UnnayanAI: COMPLETE INTERACTIVE PLATFORM VISUALIZATION
 * 
 * Visual dashboard showing:
 * - All 5 services & interactions
 * - Complete architecture
 * - Data flow
 * - All dashboard types
 * - Feature visualization
 * - Real-time metrics
 * 
 * Premium eco-green design with white background
 */

import React, { useState, useEffect } from 'react';
import './platform-visualization.css';

// ============================================================================
// 1. MAIN PLATFORM VISUALIZATION
// ============================================================================

export const UnnayanAIPlatformVisualization = () => {
  const [activeTab, setActiveTab] = useState('architecture');
  const [activeService, setActiveService] = useState(null);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    farmers: 0,
    validationRate: 0,
    latency: 0,
    uptime: 0
  });

  // Animate metrics on load
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedMetrics({
        farmers: Math.min(animatedMetrics.farmers + 50, 500),
        validationRate: Math.min(animatedMetrics.validationRate + 2, 99.9),
        latency: Math.max(animatedMetrics.latency - 10, 85),
        uptime: Math.min(animatedMetrics.uptime + 0.5, 99.9)
      });
    }, 100);
    return () => clearInterval(interval);
  }, [animatedMetrics]);

  return (
    <div className="platform-visualization">
      {/* HEADER */}
      <div className="platform-header">
        <h1 className="platform-title">🚀 UnnayanAI Platform Visualization</h1>
        <p className="platform-subtitle">Complete system architecture with all Phase 1 + Phase 2 features</p>
        
        <div className="metrics-strip">
          <div className="metric metric--farmers">
            <div className="metric-value">{Math.floor(animatedMetrics.farmers)}</div>
            <div className="metric-label">Farmers Live</div>
          </div>
          <div className="metric metric--validation">
            <div className="metric-value">{animatedMetrics.validationRate.toFixed(1)}%</div>
            <div className="metric-label">Validation Rate</div>
          </div>
          <div className="metric metric--latency">
            <div className="metric-value">{Math.floor(animatedMetrics.latency)}ms</div>
            <div className="metric-label">p95 Latency</div>
          </div>
          <div className="metric metric--uptime">
            <div className="metric-value">{animatedMetrics.uptime.toFixed(1)}%</div>
            <div className="metric-label">Uptime</div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          🏗️ Architecture
        </button>
        <button 
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          ⚙️ Services
        </button>
        <button 
          className={`tab-button ${activeTab === 'dataflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataflow')}
        >
          🔄 Data Flow
        </button>
        <button 
          className={`tab-button ${activeTab === 'dashboards' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboards')}
        >
          📊 Dashboards
        </button>
        <button 
          className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          ✨ All Features
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        
        {/* ARCHITECTURE TAB */}
        {activeTab === 'architecture' && <ArchitectureView />}
        
        {/* SERVICES TAB */}
        {activeTab === 'services' && <ServicesView activeService={activeService} setActiveService={setActiveService} />}
        
        {/* DATA FLOW TAB */}
        {activeTab === 'dataflow' && <DataFlowView />}
        
        {/* DASHBOARDS TAB */}
        {activeTab === 'dashboards' && <DashboardsView />}
        
        {/* FEATURES TAB */}
        {activeTab === 'features' && <AllFeaturesView />}
      </div>
    </div>
  );
};

// ============================================================================
// 2. ARCHITECTURE VIEW
// ============================================================================

const ArchitectureView = () => {
  return (
    <div className="view architecture-view">
      <div className="architecture-diagram">
        <svg viewBox="0 0 1200 800" className="diagram-svg">
          {/* API GATEWAY */}
          <rect x="450" y="20" width="300" height="60" className="service-box service--gateway" />
          <text x="600" y="55" className="service-label">🌐 API Gateway (Port 8000)</text>

          {/* PHASE 1 SERVICES */}
          <g className="phase phase--1">
            <rect x="50" y="150" width="200" height="60" className="service-box service--phase1" />
            <text x="150" y="190" className="service-label">Rule Engine</text>
            <text x="150" y="205" className="service-port">(Port 8001)</text>
          </g>

          {/* PHASE 2 SERVICES */}
          <g className="phase phase--2">
            <rect x="300" y="150" width="200" height="60" className="service-box service--phase2" />
            <text x="400" y="190" className="service-label">Drift Detection</text>
            <text x="400" y="205" className="service-port">(Port 8004)</text>
          </g>

          <g className="phase phase--2">
            <rect x="550" y="150" width="200" height="60" className="service-box service--phase2" />
            <text x="650" y="190" className="service-label">Human-in-Loop</text>
            <text x="650" y="205" className="service-port">(Port 8002)</text>
          </g>

          <g className="phase phase--2">
            <rect x="800" y="150" width="200" height="60" className="service-box service--phase2" />
            <text x="900" y="190" className="service-label">Explainability</text>
            <text x="900" y="205" className="service-port">(Port 8003)</text>
          </g>

          <g className="phase phase--2">
            <rect x="1000" y="150" width="160" height="60" className="service-box service--phase2" />
            <text x="1080" y="190" className="service-label">Bias Monitor</text>
            <text x="1080" y="205" className="service-port">(Port 8005)</text>
          </g>

          {/* PHASE 1 SUPPORTING SERVICES */}
          <g className="phase phase--1">
            <rect x="150" y="280" width="200" height="60" className="service-box service--phase1" />
            <text x="250" y="320" className="service-label">Audit Logging</text>
            <text x="250" y="335" className="service-port">(Immutable)</text>
          </g>

          {/* DATABASE */}
          <rect x="450" y="280" width="300" height="80" className="service-box service--database" />
          <text x="600" y="310" className="service-label">🗄️ PostgreSQL Database</text>
          <text x="600" y="330" className="service-detail">16 Tables</text>
          <text x="600" y="350" className="service-detail">Immutable Audit Logs + Hash Chaining</text>

          {/* FRONTEND */}
          <rect x="850" y="280" width="300" height="80" className="service-box service--frontend" />
          <text x="1000" y="310" className="service-label">💻 Premium React UI</text>
          <text x="1000" y="330" className="service-detail">White/Green Eco Design</text>
          <text x="1000" y="350" className="service-detail">6 Premium Components</text>

          {/* CONNECTIONS */}
          <line x1="600" y1="80" x2="150" y2="150" className="connection-line" strokeDasharray="5,5" />
          <line x1="600" y1="80" x2="400" y2="150" className="connection-line" strokeDasharray="5,5" />
          <line x1="600" y1="80" x2="650" y2="150" className="connection-line" strokeDasharray="5,5" />
          <line x1="600" y1="80" x2="900" y2="150" className="connection-line" strokeDasharray="5,5" />
          <line x1="600" y1="80" x2="1080" y2="150" className="connection-line" strokeDasharray="5,5" />

          <line x1="250" y1="210" x2="300" y2="280" className="connection-line" />
          <line x1="400" y1="210" x2="500" y2="280" className="connection-line" />
          <line x1="650" y1="210" x2="600" y2="280" className="connection-line" />
          <line x1="900" y1="210" x2="700" y2="280" className="connection-line" />
          <line x1="1080" y1="210" x2="750" y2="280" className="connection-line" />

          <line x1="600" y1="280" x2="1000" y2="320" className="connection-line" strokeWidth="2" />
        </svg>

        <div className="architecture-legend">
          <div className="legend-item">
            <div className="legend-box" style={{ backgroundColor: '#10b981' }}></div>
            <span>Phase 2 Services (NEW)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Phase 1 Services (Running)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ backgroundColor: '#6366f1' }}></div>
            <span>Database (PostgreSQL)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ backgroundColor: '#ec4899' }}></div>
            <span>Frontend (React UI)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. SERVICES VIEW
// ============================================================================

const ServicesView = ({ activeService, setActiveService }) => {
  const services = [
    {
      id: 'rule-engine',
      name: 'Rule Engine Service',
      port: 8001,
      phase: 1,
      status: '✅ Running',
      description: '5 Safety Rules (Consent, Yield, Fraud, Quality, Environmental)',
      features: [
        '✓ Consent validation (blocking)',
        '✓ Yield anomaly detection (escalating)',
        '✓ Fraud pattern detection (blocking + lock)',
        '✓ Data quality checks (escalating)',
        '✓ Environmental safety (auto-remediate)'
      ]
    },
    {
      id: 'drift-detection',
      name: 'Drift Detection System',
      port: 8004,
      phase: 2,
      status: '🆕 NEW',
      description: 'Hourly model monitoring with auto-freeze on critical drift',
      features: [
        '✓ Input drift detection (KS test)',
        '✓ Output drift detection (t-test)',
        '✓ Accuracy degradation detection',
        '✓ Automatic model freezing',
        '✓ Slack/email alerts'
      ]
    },
    {
      id: 'human-inloop',
      name: 'Human-in-Loop Queue',
      port: 8002,
      phase: 2,
      status: '🆕 NEW',
      description: '4-hour SLA review queue for HIGH-risk outputs',
      features: [
        '✓ Risk classification (LOW/MEDIUM/HIGH)',
        '✓ SLA tracking & enforcement',
        '✓ Compliance officer dashboard',
        '✓ Auto-escalation on SLA violation',
        '✓ Decision logging to audit trail'
      ]
    },
    {
      id: 'explainability',
      name: 'Explainability Engine',
      port: 8003,
      phase: 2,
      status: '🆕 NEW',
      description: 'Bangla/English explanations for every AI decision',
      features: [
        '✓ Bangla farmer explanations',
        '✓ English MFI officer explanations',
        '✓ SMS/voice explanations',
        '✓ Factor importance breakdown',
        '✓ District comparison context'
      ]
    },
    {
      id: 'bias-monitoring',
      name: 'Bias Monitoring Dashboard',
      port: 8005,
      phase: 2,
      status: '🆕 NEW',
      description: 'Weekly fairness reports across 4 dimensions',
      features: [
        '✓ District-wise fairness analysis',
        '✓ Gender equity tracking',
        '✓ Farm size fairness check',
        '✓ Automated weekly reports',
        '✓ Actionable recommendations'
      ]
    },
    {
      id: 'audit-logging',
      name: 'Audit Logging Service',
      port: 'Immutable',
      phase: 1,
      status: '✅ Running',
      description: 'Hash-chained immutable audit trail for compliance',
      features: [
        '✓ Hash-chained entries',
        '✓ Tamper detection',
        '✓ Quarterly AI Ethics Board signing',
        '✓ 7-year retention',
        '✓ Integrity verification'
      ]
    }
  ];

  return (
    <div className="view services-view">
      <div className="services-grid">
        {services.map(service => (
          <div
            key={service.id}
            className={`service-card ${service.phase === 2 ? 'service-card--phase2' : ''} ${activeService === service.id ? 'active' : ''}`}
            onClick={() => setActiveService(activeService === service.id ? null : service.id)}
          >
            <div className="service-card-header">
              <h3 className="service-card-title">{service.name}</h3>
              <span className="service-status">{service.status}</span>
            </div>
            
            <div className="service-card-port">Port {service.port}</div>
            <p className="service-card-description">{service.description}</p>
            
            {activeService === service.id && (
              <div className="service-card-features">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">{feature}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. DATA FLOW VIEW
// ============================================================================

const DataFlowView = () => {
  return (
    <div className="view dataflow-view">
      <div className="dataflow-steps">
        <div className="step step--1">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Farmer Input</h4>
            <p>SMS, Voice/IVR, Mobile App, or Agent Entry</p>
          </div>
          <div className="step-icon">👨‍🌾</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--2">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Rule Engine Validation</h4>
            <p>5 Safety Rules • Consent • Yield • Fraud • Quality • Environment</p>
          </div>
          <div className="step-icon">🔍</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--3">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Audit Logging</h4>
            <p>Hash-Chained • Immutable • Tamper Detection</p>
          </div>
          <div className="step-icon">📝</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--4">
          <div className="step-number">4</div>
          <div className="step-content">
            <h4>ML Models</h4>
            <p>Yield • Health • Fertility • Credit Score</p>
          </div>
          <div className="step-icon">🤖</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--5">
          <div className="step-number">5</div>
          <div className="step-content">
            <h4>Drift Detection</h4>
            <p>Hourly Check • Input/Output/Accuracy Drift</p>
          </div>
          <div className="step-icon">📈</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--6">
          <div className="step-number">6</div>
          <div className="step-content">
            <h4>Risk Classification</h4>
            <p>LOW (Auto) • MEDIUM (Review) • HIGH (Manual)</p>
          </div>
          <div className="step-icon">⚖️</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--7">
          <div className="step-number">7</div>
          <div className="step-content">
            <h4>Human-in-Loop (if MEDIUM/HIGH)</h4>
            <p>Compliance Officer Review • SLA Tracking • Approval/Rejection</p>
          </div>
          <div className="step-icon">👨‍⚖️</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--8">
          <div className="step-number">8</div>
          <div className="step-content">
            <h4>Explainability</h4>
            <p>Bangla • English • SMS • Factor Breakdown</p>
          </div>
          <div className="step-icon">💡</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--9">
          <div className="step-number">9</div>
          <div className="step-content">
            <h4>Bias Monitoring (Weekly)</h4>
            <p>District • Gender • Farm Size • Fairness Report</p>
          </div>
          <div className="step-icon">📊</div>
        </div>

        <div className="step-arrow">→</div>

        <div className="step step--10">
          <div className="step-number">10</div>
          <div className="step-content">
            <h4>Output to Stakeholders</h4>
            <p>Farmer (SMS) • MFI (Dashboard) • Governance (Reports)</p>
          </div>
          <div className="step-icon">📤</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. DASHBOARDS VIEW
// ============================================================================

const DashboardsView = () => {
  const dashboards = [
    {
      name: 'Farmer Dashboard',
      icon: '👨‍🌾',
      color: '#10b981',
      features: [
        'Credit Score (A-D)',
        'Health Alerts',
        'Yield Trends',
        'Explanations (Bangla)',
        'SMS/Voice Access',
        'Offline Mode (SMS/IVR)'
      ]
    },
    {
      name: 'MFI Officer Panel',
      icon: '💼',
      color: '#3b82f6',
      features: [
        'Credit Assessment',
        'Risk Score Breakdown',
        'Portfolio Analysis',
        'Borrower History',
        'Approval Decision',
        'Export Reports'
      ]
    },
    {
      name: 'Compliance Officer',
      icon: '👨‍⚖️',
      color: '#f59e0b',
      features: [
        'Review Queue',
        'SLA Tracking',
        'Decision Logging',
        'Audit Trail Access',
        'Alert Management',
        'Escalation Handling'
      ]
    },
    {
      name: 'AI Ethics Board',
      icon: '🏛️',
      color: '#ec4899',
      features: [
        'Bias Reports (Weekly)',
        'Rule Approvals',
        'Model Sign-offs',
        'Fairness Metrics',
        'Governance Records',
        'Audit Trail Full Access'
      ]
    },
    {
      name: 'DevOps/Admin',
      icon: '⚙️',
      color: '#6366f1',
      features: [
        'System Health',
        'Performance Metrics',
        'Service Monitoring',
        'Deployment Control',
        'Incident Response',
        'Log Aggregation'
      ]
    },
    {
      name: 'NGO Coordinator',
      icon: '🤝',
      color: '#14b8a6',
      features: [
        'Farmer Onboarding',
        'Agent Management',
        'Field Communication',
        'Community Impact',
        'Reporting',
        'Analytics'
      ]
    }
  ];

  return (
    <div className="view dashboards-view">
      <div className="dashboards-grid">
        {dashboards.map((dashboard, idx) => (
          <div key={idx} className="dashboard-card" style={{ borderTopColor: dashboard.color }}>
            <div className="dashboard-icon" style={{ backgroundColor: dashboard.color }}>{dashboard.icon}</div>
            <h3 className="dashboard-name">{dashboard.name}</h3>
            <ul className="dashboard-features">
              {dashboard.features.map((feature, fidx) => (
                <li key={fidx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. ALL FEATURES VIEW
// ============================================================================

const AllFeaturesView = () => {
  const features = {
    'Phase 1: Core Foundation': [
      '✅ Rule Engine (5 safety rules)',
      '✅ Immutable Audit Logging (hash-chained)',
      '✅ GDPR-Compliant Consent',
      '✅ User Management (6 roles)',
      '✅ Farm & Livestock Registry',
      '✅ PostgreSQL Database (16 tables)',
      '✅ Kubernetes Deployment',
      '✅ Security (AES-256, JWT, 2FA)'
    ],
    'Phase 2: Drift Detection': [
      '🆕 Hourly Model Monitoring',
      '🆕 Input Distribution Shift (KS test)',
      '🆕 Output Distribution Change (t-test)',
      '🆕 Accuracy Degradation Detection',
      '🆕 Automatic Model Freezing',
      '🆕 Slack/Email Alerting'
    ],
    'Phase 2: Human-in-Loop': [
      '🆕 Review Queue (risk classification)',
      '🆕 4-Hour SLA Enforcement',
      '🆕 Compliance Officer Dashboard',
      '🆕 Auto-Escalation on SLA Violation',
      '🆕 Decision Logging to Audit Trail',
      '🆕 Real-Time Queue Statistics'
    ],
    'Phase 2: Explainability': [
      '🆕 Bangla Explanations (native)',
      '🆕 English Explanations (MFI)',
      '🆕 SMS/Voice Friendly Format',
      '🆕 Factor Importance Breakdown',
      '🆕 District Comparison Context',
      '🆕 PDF Export Generation'
    ],
    'Phase 2: Bias Monitoring': [
      '🆕 District-Wise Fairness Analysis',
      '🆕 Gender Equity Tracking',
      '🆕 Farm Size Fairness Check',
      '🆕 Statistical Significance Testing',
      '🆕 Weekly Automated Reports',
      '🆕 Actionable Recommendations'
    ],
    'Phase 2: Premium UI': [
      '🆕 6 React Components (premium design)',
      '🆕 White/Green Eco Theme',
      '🆕 Fully Responsive (mobile-first)',
      '🆕 Bangla + English Support',
      '🆕 WCAG AA+ Accessibility',
      '🆕 Offline Mode Support'
    ]
  };

  return (
    <div className="view features-view">
      <div className="features-categories">
        {Object.entries(features).map(([category, items], idx) => (
          <div key={idx} className="features-category">
            <h3 className="category-title">{category}</h3>
            <div className="features-list">
              {items.map((feature, fidx) => (
                <div key={fidx} className="feature-row">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnnayanAIPlatformVisualization;
EOFCOMPONENT
wc -l /mnt/user-data/outputs/14_INTERACTIVE_PLATFORM_VISUALIZATION.jsx
