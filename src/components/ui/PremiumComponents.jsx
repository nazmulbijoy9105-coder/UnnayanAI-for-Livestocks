/**
 * UnnayanAI: Premium Eco-Green UI Components
 * 
 * Design Philosophy:
 * - Clean white background (minimalist, focuses on data)
 * - Sustainable green accent (#10b981 - Emerald Green)
 * - Large readable typography (Bangla & English support)
 * - Accessible color contrast (WCAG AA+)
 * - Mobile-first responsive design
 * - Offline-first architecture
 * 
 * Component Library for all dashboard features
 */

import React, { useState, useEffect } from 'react';
import './styles.css';

// ============================================================================
// 1. CREDIT SCORE EXPLANATION CARD (Premium white/green)
// ============================================================================

export const CreditScoreCard = ({ score, riskClass, factors, farmerName }) => {
  const getColorByClass = (riskClass) => {
    const colors = {
      'A': '#10b981',  // Green - Low risk
      'B': '#f59e0b',  // Amber - Medium risk
      'C': '#ef4444',  // Red - High risk
      'D': '#991b1b'   // Dark red - Critical
    };
    return colors[riskClass] || '#10b981';
  };

  return (
    <div className="card card--premium card--credit-score">
      <div className="card-header">
        <h2 className="card-title">ক্রেডিট স্কোর মূল্যায়ন</h2>
        <div className="score-badge" style={{ backgroundColor: getColorByClass(riskClass) }}>
          {score.toFixed(0)}
          <span className="risk-class">{riskClass}</span>
        </div>
      </div>

      <div className="card-body">
        <p className="farmer-name">খামারী: {farmerName}</p>
        
        <div className="factors-grid">
          {factors && Object.entries(factors).map(([factorName, data]) => (
            <div key={factorName} className="factor-card">
              <div className="factor-icon">{data.emoji}</div>
              <div className="factor-name">{factorName}</div>
              <div className="factor-value">{data.value.toFixed(0)}/100</div>
              <div className="factor-contribution">
                {(data.weight * 100).toFixed(0)}% weight
              </div>
              <p className="factor-explanation">{data.explanation}</p>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button className="btn btn--primary btn--eco">
            সম্পূর্ণ বিবরণ দেখুন
          </button>
          <button className="btn btn--secondary">
            পিডিএফ রপ্তানি করুন
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. BIAS MONITORING DASHBOARD
// ============================================================================

export const BiasMonitoringDashboard = ({ report }) => {
  const getStatusColor = (status) => {
    const colors = {
      'ok': '#10b981',
      'warning': '#f59e0b',
      'critical': '#ef4444'
    };
    return colors[status] || '#10b981';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'ok': '✅',
      'warning': '⚠️',
      'critical': '🚨'
    };
    return icons[status] || '✅';
  };

  return (
    <div className="dashboard dashboard--bias-monitoring">
      <div className="dashboard-header">
        <h1 className="dashboard-title">পক্ষপাতমুক্তা পর্যবেক্ষণ ড্যাশবোর্ড</h1>
        <p className="dashboard-date">আপডেট: {new Date().toLocaleDateString('bn-BD')}</p>
      </div>

      {/* Overall Status */}
      <div className="status-banner" style={{ backgroundColor: getStatusColor(report.overall_status) }}>
        <span className="status-icon">{getStatusIcon(report.overall_status)}</span>
        <div className="status-text">
          <h2 className="status-title">সামগ্রিক স্থিতি</h2>
          <p className="status-description">
            {report.overall_status === 'ok' && 'সকল ন্যায্যতা মেট্রিক্স সীমার মধ্যে রয়েছে'}
            {report.overall_status === 'warning' && 'কিছু মেট্রিক্স সতর্কতা প্রয়োজন'}
            {report.overall_status === 'critical' && 'জরুরি পর্যালোচনা প্রয়োজন'}
          </p>
        </div>
      </div>

      {/* Dimensions Grid */}
      <div className="dimensions-grid">
        {Object.entries(report.dimensions).map(([dimKey, dimData]) => (
          <div key={dimKey} className="dimension-card" style={{
            borderLeftColor: getStatusColor(dimData.status)
          }}>
            <div className="dimension-header">
              <h3 className="dimension-name">
                {dimData.dimension?.replace(/_/g, ' ')}
              </h3>
              <span className="dimension-status">{getStatusIcon(dimData.status)}</span>
            </div>
            
            <div className="dimension-body">
              <p className="dimension-metric">
                সর্বোচ্চ বৈষম্য: <strong>{(dimData.max_disparity * 100).toFixed(1)}%</strong>
              </p>
              
              <div className="dimension-groups">
                {Object.entries(dimData.groups || {}).map(([groupName, groupData]) => (
                  <div key={groupName} className="group-item">
                    <span className="group-name">{groupName}</span>
                    <span className="group-parity">{groupData.parity}</span>
                  </div>
                ))}
              </div>

              <p className="dimension-message">{dimData.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2 className="recommendations-title">সুপারিশসমূহ</h2>
        <ul className="recommendations-list">
          {report.recommendations?.map((rec, idx) => (
            <li key={idx} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// 3. HUMAN-IN-LOOP REVIEW QUEUE
// ============================================================================

export const ReviewQueuePanel = ({ reviews, onDecision }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [decision, setDecision] = useState('');

  return (
    <div className="panel panel--review-queue">
      <div className="panel-header">
        <h2 className="panel-title">
          🔍 মানব পর্যালোচনা সারি ({reviews.length})
        </h2>
        <div className="sla-indicator">
          <span className="urgent-count">জরুরি: {reviews.filter(r => r.sla_violated).length}</span>
        </div>
      </div>

      <div className="review-list">
        {reviews.map(review => (
          <div
            key={review.review_id}
            className={`review-item ${review.sla_violated ? 'review--sla-violated' : ''}`}
            onClick={() => setSelectedReview(review)}
          >
            <div className="review-info">
              <h3 className="review-type">{review.output_type}</h3>
              <p className="review-farm">খামার ID: {review.farm_id}</p>
              <p className="review-time">
                {review.hours_remaining > 0
                  ? `${review.hours_remaining.toFixed(0)} ঘণ্টা বাকি`
                  : '🚨 SLA অতিক্রম করেছে'}
              </p>
            </div>
            <span className={`risk-badge risk--${review.risk_level}`}>
              {review.risk_level.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {selectedReview && (
        <div className="review-detail-modal">
          <h3 className="modal-title">পর্যালোচনা বিস্তারিত</h3>
          <p>{selectedReview.description}</p>
          
          <div className="decision-options">
            <button 
              className="btn btn--success"
              onClick={() => onDecision(selectedReview.review_id, 'approved')}
            >
              ✅ অনুমোদন করুন
            </button>
            <button 
              className="btn btn--danger"
              onClick={() => onDecision(selectedReview.review_id, 'rejected')}
            >
              ❌ প্রত্যাখ্যান করুন
            </button>
            <button 
              className="btn btn--info"
              onClick={() => onDecision(selectedReview.review_id, 'escalate')}
            >
              ⬆️ উন্নীত করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. DRIFT DETECTION ALERTS
// ============================================================================

export const DriftAlertsBanner = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.alert_id));

  if (activeAlerts.length === 0) {
    return (
      <div className="alert-banner alert-banner--success">
        <span className="alert-icon">✅</span>
        <span className="alert-text">সকল মডেল স্থিতিশীল - কোন বিচ্যুতি সনাক্ত নেই</span>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      {activeAlerts.map(alert => (
        <div key={alert.alert_id} className={`alert-banner alert-banner--${alert.severity}`}>
          <span className="alert-icon">
            {alert.severity === 'critical' && '🚨'}
            {alert.severity === 'high' && '⚠️'}
            {alert.severity === 'medium' && '⚡'}
            {alert.severity === 'low' && 'ℹ️'}
          </span>
          <div className="alert-content">
            <h3 className="alert-title">{alert.drift_type.replace(/_/g, ' ')}</h3>
            <p className="alert-message">{alert.description}</p>
          </div>
          <button 
            className="alert-close"
            onClick={() => setDismissedAlerts([...dismissedAlerts, alert.alert_id])}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 5. EXPLAINABILITY CARD
// ============================================================================

export const ExplanationCard = ({ explanation, language = 'bangla' }) => {
  const displayText = language === 'bangla' 
    ? explanation.explanation_bangla 
    : explanation.explanation_english;

  return (
    <div className="card card--explanation card--eco">
      <div className="card-header">
        <h3 className="card-title">🎯 AI সিদ্ধান্ত ব্যাখ্যা</h3>
        <button className="btn--icon">🔊 শুনুন</button>
      </div>

      <div className="card-body">
        <p className="explanation-text">{displayText}</p>
        
        <div className="factors-summary">
          {explanation.factors && Object.entries(explanation.factors).map(([name, data]) => (
            <div key={name} className="factor-bar">
              <span className="factor-label">{name}</span>
              <div className="factor-progress">
                <div 
                  className="factor-fill"
                  style={{ width: `${data.contribution}%`, backgroundColor: '#10b981' }}
                />
              </div>
              <span className="factor-percent">{(data.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {explanation.district_average && (
          <div className="comparison-box">
            <p className="comparison-label">জেলা তুলনা</p>
            <p className="comparison-value">
              আপনার খামার: <strong style={{ color: '#10b981' }}>
                {explanation.result_value.toFixed(0)}
              </strong> vs জেলা গড়: {explanation.district_average.toFixed(0)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 6. METRICS DASHBOARD
// ============================================================================

export const MetricsDashboard = ({ metrics }) => {
  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon">👩‍🌾</div>
        <div className="metric-value">{metrics.farmers_active || 0}</div>
        <div className="metric-label">সক্রিয় খামারী</div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">✅</div>
        <div className="metric-value">{(metrics.validation_rate * 100 || 0).toFixed(1)}%</div>
        <div className="metric-label">বৈধতা হার</div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">⚡</div>
        <div className="metric-value">{metrics.avg_latency_ms || 0}ms</div>
        <div className="metric-label">গড় সময়</div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">🎯</div>
        <div className="metric-value">{(metrics.model_accuracy * 100 || 0).toFixed(1)}%</div>
        <div className="metric-label">মডেল নির্ভুলতা</div>
      </div>
    </div>
  );
};

export default {
  CreditScoreCard,
  BiasMonitoringDashboard,
  ReviewQueuePanel,
  DriftAlertsBanner,
  ExplanationCard,
  MetricsDashboard
};
