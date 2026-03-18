-- UnnayanAI Production Database Schema
-- Critical tables for Rule Engine, Audit Logging, Model Management
-- Version 1.0 | March 2026

-- ============================================================================
-- SECTION 1: CORE IDENTITY & ACCESS
-- ============================================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL,  -- 'farmer', 'agent', 'ngo', 'mfi', 'donor', 'admin'
    district VARCHAR(100),
    language_preference VARCHAR(10) DEFAULT 'bangla',  -- 'bangla', 'english'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    device_fingerprint VARCHAR(256),
    
    CONSTRAINT role_check CHECK (role IN ('farmer', 'agent', 'ngo', 'mfi', 'donor', 'admin'))
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_district ON users(district);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- SECTION 2: CONSENT & DATA GOVERNANCE
-- ============================================================================

CREATE TABLE farmer_consent (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,  -- 'voice_recorded', 'sms', 'app'
    purpose VARCHAR(100),  -- 'data_collection', 'credit_assessment', 'iot_monitoring'
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP NOT NULL,
    voice_file_encrypted_path VARCHAR(512),  -- AES-256 encrypted file path
    voice_file_hash VARCHAR(256),  -- SHA-256 hash for verification
    consent_version_number INT DEFAULT 1,
    expires_at TIMESTAMP,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    revoke_reason TEXT,
    ip_address VARCHAR(15),
    user_agent TEXT,
    
    CONSTRAINT consent_purpose_check CHECK (purpose IN ('data_collection', 'credit_assessment', 'iot_monitoring', 'general'))
);

CREATE INDEX idx_consent_farmer ON farmer_consent(farmer_id);
CREATE INDEX idx_consent_active ON farmer_consent(farmer_id, revoked, expires_at);

-- ============================================================================
-- SECTION 3: FARM & LIVESTOCK REGISTRY
-- ============================================================================

CREATE TABLE farms (
    farm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    farm_name VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    number_of_cows INT,
    farm_size_category VARCHAR(20),  -- 'smallholder', 'small', 'medium', 'large'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_farms_farmer ON farms(farmer_id);
CREATE INDEX idx_farms_district ON farms(district);

CREATE TABLE cows (
    cow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id) ON DELETE CASCADE,
    tag_number VARCHAR(50) UNIQUE,
    breed VARCHAR(100),
    birth_date DATE,
    status VARCHAR(20) DEFAULT 'active',  -- 'active', 'sold', 'dead', 'sick'
    current_lactation_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cows_farm ON cows(farm_id);
CREATE INDEX idx_cows_tag ON cows(tag_number);

-- ============================================================================
-- SECTION 4: RULE ENGINE & CONFIGURATION
-- ============================================================================

CREATE TABLE rules_config (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'consent', 'yield', 'fraud', 'environmental', 'credit'
    rule_type VARCHAR(50),  -- 'threshold', 'pattern', 'logic', 'status'
    threshold_value FLOAT,
    operator VARCHAR(10),  -- '>', '<', '==', '>=', '<=', 'contains', 'not_contains'
    action_on_trigger VARCHAR(50) NOT NULL,  -- 'block', 'escalate', 'alert', 'auto_remediate'
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP,
    ai_ethics_approved BOOLEAN DEFAULT false,
    ai_ethics_approval_timestamp TIMESTAMP,
    approved_by VARCHAR(100),
    notes TEXT,
    
    CONSTRAINT category_check CHECK (category IN ('consent', 'yield', 'fraud', 'environmental', 'credit', 'data_quality')),
    CONSTRAINT action_check CHECK (action_on_trigger IN ('block', 'escalate', 'alert', 'auto_remediate'))
);

CREATE INDEX idx_rules_enabled ON rules_config(enabled);
CREATE INDEX idx_rules_category ON rules_config(category);
CREATE INDEX idx_rules_approved ON rules_config(ai_ethics_approved);

-- ============================================================================
-- SECTION 5: IMMUTABLE AUDIT LOG (Hash-Chained)
-- ============================================================================

CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,  -- 'rule_validation', 'ml_prediction', 'rule_violation', 'data_access', etc.
    severity VARCHAR(20),  -- 'info', 'warning', 'error', 'critical'
    farmer_id UUID REFERENCES users(user_id),
    farm_id UUID REFERENCES farms(farm_id),
    rule_triggered VARCHAR(100),
    model_name VARCHAR(100),
    model_version VARCHAR(20),
    
    event_data JSONB NOT NULL,  -- Full event details as JSON
    
    ip_address VARCHAR(15),
    user_agent TEXT,
    user_id UUID REFERENCES users(user_id),
    
    -- Hash chain for tamper detection
    previous_hash VARCHAR(256),
    current_hash VARCHAR(256) NOT NULL,
    hash_verified BOOLEAN DEFAULT true,
    
    -- Signing for quarterly compliance
    ai_ethics_signed BOOLEAN DEFAULT false,
    ethics_signature_timestamp TIMESTAMP,
    ethics_signature_by VARCHAR(100)
);

-- CRITICAL: Audit logs are INSERT ONLY, never updated or deleted
-- Hash chain ensures any tampering is immediately detectable

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_farmer ON audit_logs(farmer_id);
CREATE INDEX idx_audit_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_severity ON audit_logs(severity);
CREATE INDEX idx_audit_hash_verified ON audit_logs(hash_verified);

-- Trigger to prevent UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();

-- ============================================================================
-- SECTION 6: MILK YIELD TIME-SERIES DATA
-- ============================================================================

CREATE TABLE milk_yield (
    yield_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cow_id UUID NOT NULL REFERENCES cows(cow_id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(farm_id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    morning_liters DECIMAL(5, 2),
    evening_liters DECIMAL(5, 2),
    total_liters DECIMAL(5, 2) NOT NULL,
    
    recorded_by VARCHAR(50),  -- 'sms', 'voice', 'agent', 'app', 'iot'
    recorded_timestamp TIMESTAMP NOT NULL,
    
    data_quality_score DECIMAL(3, 2),  -- 0-1, 1 = high quality
    anomaly_flag BOOLEAN DEFAULT false,  -- Flagged by rule engine
    anomaly_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_yield_cow_date ON milk_yield(cow_id, date DESC);
CREATE INDEX idx_yield_farm_date ON milk_yield(farm_id, date DESC);
CREATE INDEX idx_yield_anomaly ON milk_yield(anomaly_flag);

-- ============================================================================
-- SECTION 7: BREEDING & FERTILITY DATA
-- ============================================================================

CREATE TABLE breeding_events (
    breeding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cow_id UUID NOT NULL REFERENCES cows(cow_id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    
    heat_detected_date DATE NOT NULL,
    ai_date DATE,
    pregnancy_check_date DATE,
    
    conception_status VARCHAR(20),  -- 'success', 'failed', 'pending'
    is_pregnant BOOLEAN,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_breeding_cow ON breeding_events(cow_id);
CREATE INDEX idx_breeding_farm ON breeding_events(farm_id);

-- ============================================================================
-- SECTION 8: HEALTH & SYMPTOMS LOG
-- ============================================================================

CREATE TABLE health_logs (
    health_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cow_id UUID NOT NULL REFERENCES cows(cow_id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    
    symptom_text TEXT,
    symptom_category VARCHAR(50),  -- 'respiratory', 'mastitis', 'digestive', 'lameness', 'other'
    severity_reported VARCHAR(20),  -- 'mild', 'moderate', 'severe'
    
    temperature_celsius DECIMAL(5, 2),
    vet_visit BOOLEAN DEFAULT false,
    treatment_given TEXT,
    
    risk_score DECIMAL(3, 2),  -- 0-1, computed by ML model
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_health_cow ON health_logs(cow_id);
CREATE INDEX idx_health_risk ON health_logs(risk_score DESC);

-- ============================================================================
-- SECTION 9: IOT SENSOR DATA
-- ============================================================================

CREATE TABLE barn_sensors (
    sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    sensor_type VARCHAR(50),  -- 'ammonia', 'co2', 'humidity', 'temperature', 'noise'
    installed_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    calibration_date TIMESTAMP,
    last_maintenance TIMESTAMP
);

CREATE INDEX idx_sensors_farm ON barn_sensors(farm_id);
CREATE INDEX idx_sensors_active ON barn_sensors(is_active);

-- Store time-series data (can be split into separate TimescaleDB hypertable in production)
CREATE TABLE sensor_readings (
    reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES barn_sensors(sensor_id),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    
    timestamp TIMESTAMP NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),  -- 'ppm', '%', 'celsius', 'db'
    
    quality_flag BOOLEAN DEFAULT true,  -- false if sensor malfunction detected
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_readings_farm_time ON sensor_readings(farm_id, timestamp DESC);
CREATE INDEX idx_readings_sensor_time ON sensor_readings(sensor_id, timestamp DESC);

-- ============================================================================
-- SECTION 10: AI MODEL OUTPUTS & PREDICTIONS
-- ============================================================================

CREATE TABLE model_predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    cow_id UUID REFERENCES cows(cow_id),
    
    model_name VARCHAR(100) NOT NULL,  -- 'yield_forecast', 'health_risk', 'credit_score'
    model_version VARCHAR(20) NOT NULL,  -- 'v2.3', 'v3.1'
    
    input_features JSONB NOT NULL,
    prediction_value DECIMAL(10, 4),
    prediction_confidence DECIMAL(3, 2),  -- 0-1
    
    risk_level VARCHAR(20),  -- 'low', 'medium', 'high'
    requires_human_review BOOLEAN DEFAULT false,
    
    explanation JSONB,  -- Feature importance breakdown
    
    actual_value DECIMAL(10, 4),  -- Populated later for accuracy tracking
    prediction_date DATE,
    actual_observed_date DATE,
    
    accuracy_error DECIMAL(10, 4),  -- Calculated when actual_value known
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_predictions_model ON model_predictions(model_name, model_version);
CREATE INDEX idx_predictions_farm ON model_predictions(farm_id);
CREATE INDEX idx_predictions_risk ON model_predictions(risk_level);
CREATE INDEX idx_predictions_review ON model_predictions(requires_human_review);

-- ============================================================================
-- SECTION 11: CREDIT SCORE & FINANCIAL ASSESSMENTS
-- ============================================================================

CREATE TABLE credit_scores (
    score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    
    yield_stability_index DECIMAL(5, 2),  -- 0-100
    health_index DECIMAL(5, 2),
    fertility_efficiency DECIMAL(5, 2),
    environmental_compliance DECIMAL(5, 2),
    
    total_score DECIMAL(5, 2) NOT NULL,
    risk_class VARCHAR(5),  -- 'A', 'B', 'C', 'D'
    
    predicted_monthly_income_bdt DECIMAL(12, 2),
    income_confidence DECIMAL(3, 2),
    
    generated_at TIMESTAMP NOT NULL,
    model_version VARCHAR(20),
    
    -- Human review tracking
    requires_human_review BOOLEAN DEFAULT false,
    reviewed_by VARCHAR(100),
    review_status VARCHAR(20),  -- 'pending', 'approved', 'rejected', 'escalated'
    review_notes TEXT,
    review_timestamp TIMESTAMP,
    
    -- Next review schedule
    next_review_date DATE,
    
    audit_log_id UUID REFERENCES audit_logs(audit_id),
    prediction_id UUID REFERENCES model_predictions(prediction_id)
);

CREATE INDEX idx_credit_farm ON credit_scores(farm_id);
CREATE INDEX idx_credit_class ON credit_scores(risk_class);
CREATE INDEX idx_credit_review ON credit_scores(review_status);

-- ============================================================================
-- SECTION 12: HUMAN-IN-LOOP REVIEW QUEUE
-- ============================================================================

CREATE TABLE review_queue (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    output_type VARCHAR(50),  -- 'credit_score', 'health_alert', 'environmental_action'
    output_id UUID,  -- References credit_scores, health_logs, etc.
    
    risk_level VARCHAR(20) NOT NULL,  -- 'medium', 'high'
    priority VARCHAR(20),  -- 'normal', 'urgent'
    
    created_at TIMESTAMP NOT NULL,
    sla_hours INT,  -- Service level agreement
    sla_due_at TIMESTAMP,
    
    assigned_to VARCHAR(100),  -- Compliance officer
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'escalated'
    
    decision TEXT,  -- 'approved', 'rejected', 'escalated_to_ngo', 'escalated_to_board'
    decision_reason TEXT,
    decided_by VARCHAR(100),
    decided_at TIMESTAMP,
    
    time_to_review_minutes INT,  -- Computed after completion
    
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_review_status ON review_queue(status);
CREATE INDEX idx_review_assigned ON review_queue(assigned_to);
CREATE INDEX idx_review_sla ON review_queue(sla_due_at) WHERE status = 'pending';

-- ============================================================================
-- SECTION 13: MODEL REGISTRY & VERSIONING
-- ============================================================================

CREATE TABLE model_registry (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    model_name VARCHAR(100) NOT NULL,  -- 'yield_forecast', 'health_risk', 'credit_score'
    model_version VARCHAR(20) NOT NULL,  -- 'v2.3'
    
    model_type VARCHAR(50),  -- 'lstm', 'xgboost', 'logistic_regression'
    framework VARCHAR(50),  -- 'pytorch', 'scikit-learn', 'tensorflow'
    
    training_dataset_version VARCHAR(50),  -- Git hash or version ID
    training_date DATE,
    trained_by VARCHAR(100),
    
    feature_list TEXT[],  -- Array of feature names
    feature_importance JSONB,  -- Dictionary of importance scores
    
    -- Performance metrics
    metric_mae DECIMAL(10, 4),  -- Mean Absolute Error
    metric_rmse DECIMAL(10, 4),
    metric_accuracy DECIMAL(5, 2),  -- Percentage
    metric_precision DECIMAL(5, 2),
    metric_recall DECIMAL(5, 2),
    
    -- Bias metrics
    district_bias_max DECIMAL(5, 2),  -- Max disparity across districts
    gender_bias_max DECIMAL(5, 2),
    farm_size_bias_max DECIMAL(5, 2),
    
    risk_classification VARCHAR(50),  -- 'low_risk', 'medium_risk', 'high_risk'
    
    -- AI Ethics Board approval
    ai_ethics_approved BOOLEAN DEFAULT false,
    ethics_approval_timestamp TIMESTAMP,
    ethics_approved_by VARCHAR(100),
    
    -- Production status
    in_production BOOLEAN DEFAULT false,
    production_start_date TIMESTAMP,
    production_end_date TIMESTAMP,
    
    -- Rollback info
    can_rollback_to_version VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_registry_model_version ON model_registry(model_name, model_version);
CREATE INDEX idx_registry_production ON model_registry(in_production);
CREATE INDEX idx_registry_approved ON model_registry(ai_ethics_approved);

-- ============================================================================
-- SECTION 14: DRIFT DETECTION & MONITORING
-- ============================================================================

CREATE TABLE drift_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20),
    
    alert_type VARCHAR(50),  -- 'input_drift', 'output_drift', 'accuracy_drift'
    severity VARCHAR(20),  -- 'low', 'medium', 'high'
    
    metric_name VARCHAR(100),
    metric_value DECIMAL(12, 4),
    threshold_value DECIMAL(12, 4),
    
    pvalue DECIMAL(5, 4),  -- Statistical significance
    
    description TEXT,
    
    detected_at TIMESTAMP NOT NULL,
    resolution_status VARCHAR(20) DEFAULT 'open',  -- 'open', 'investigating', 'resolved', 'false_positive'
    
    response_action TEXT,  -- e.g., 'model_retraining_frozen', 'investigation_started'
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_drift_model ON drift_alerts(model_name);
CREATE INDEX idx_drift_timestamp ON drift_alerts(detected_at DESC);
CREATE INDEX idx_drift_status ON drift_alerts(resolution_status);

-- ============================================================================
-- SECTION 15: BIAS MONITORING REPORTS
-- ============================================================================

CREATE TABLE bias_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20),
    
    report_date DATE NOT NULL,
    reporting_period VARCHAR(50),  -- 'weekly', 'monthly', 'quarterly'
    
    -- Disparity metrics
    district_disparity_max DECIMAL(5, 2),
    gender_disparity_max DECIMAL(5, 2),
    farm_size_disparity_max DECIMAL(5, 2),
    socioeconomic_disparity_max DECIMAL(5, 2),
    
    -- Overall status
    bias_status VARCHAR(20),  -- 'ok', 'warning', 'critical'
    retraining_recommended BOOLEAN DEFAULT false,
    
    detailed_findings JSONB,
    
    reviewed_by VARCHAR(100),
    review_timestamp TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bias_reports_model ON bias_reports(model_name);
CREATE INDEX idx_bias_reports_date ON bias_reports(report_date DESC);

-- ============================================================================
-- SECTION 16: FARMER APPEALS & FEEDBACK
-- ============================================================================

CREATE TABLE farmer_appeals (
    appeal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    farmer_id UUID NOT NULL REFERENCES users(user_id),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    
    appeal_type VARCHAR(100),  -- 'contest_ai_recommendation', 'contest_credit_score', 'data_correction'
    
    details TEXT NOT NULL,
    
    status VARCHAR(20) DEFAULT 'submitted',  -- 'submitted', 'under_review', 'resolved', 'closed'
    
    submitted_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    
    audit_log_id UUID REFERENCES audit_logs(audit_id)
);

CREATE INDEX idx_appeals_farmer ON farmer_appeals(farmer_id);
CREATE INDEX idx_appeals_status ON farmer_appeals(status);

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================

-- Minimal privilege principle
CREATE ROLE unnayan_app WITH PASSWORD 'CHANGE_THIS_IN_PRODUCTION';
CREATE ROLE unnayan_readonly WITH PASSWORD 'CHANGE_THIS_IN_PRODUCTION';

-- App role: Can read/write operational tables, insert to audit logs
GRANT USAGE ON SCHEMA public TO unnayan_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO unnayan_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO unnayan_app;

-- Read-only role: For donor dashboards and reporting
GRANT USAGE ON SCHEMA public TO unnayan_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO unnayan_readonly;

-- Audit logs: NO UPDATE/DELETE (prevented by trigger anyway)
REVOKE UPDATE, DELETE ON audit_logs FROM unnayan_app;

-- Rules config: Only Data Officer can modify (manual grant)
-- GRANT UPDATE ON rules_config TO 'data_officer_role'

-- ============================================================================
-- VERIFICATION & MAINTENANCE
-- ============================================================================

-- View for monitoring audit log integrity
CREATE VIEW audit_log_integrity_check AS
SELECT
    COUNT(*) as total_logs,
    SUM(CASE WHEN hash_verified = false THEN 1 ELSE 0 END) as tamper_detected,
    COUNT(DISTINCT DATE(timestamp)) as days_of_data,
    MIN(timestamp) as earliest_log,
    MAX(timestamp) as latest_log
FROM audit_logs;

-- View for rule engine status
CREATE VIEW rules_status_summary AS
SELECT
    category,
    enabled,
    COUNT(*) as rule_count,
    SUM(CASE WHEN ai_ethics_approved = true THEN 1 ELSE 0 END) as approved_count
FROM rules_config
GROUP BY category, enabled;

-- ============================================================================
-- FINAL NOTES
-- ============================================================================

-- After initial creation, set stricter permissions:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON TYPES TO unnayan_app;

-- Enable row-level security for sensitive tables in production:
-- ALTER TABLE farmer_consent ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Create materialized views for performance:
-- CREATE MATERIALIZED VIEW farm_productivity_summary AS ...
-- CREATE MATERIALIZED VIEW mfi_credit_portfolio AS ...

-- For TimescaleDB (recommended for time-series):
-- SELECT create_hypertable('milk_yield', 'date', if_not_exists => TRUE);
-- SELECT create_hypertable('sensor_readings', 'timestamp', if_not_exists => TRUE);
