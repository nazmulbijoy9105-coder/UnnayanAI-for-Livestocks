# UnnayanAI: Production Deployment Configuration

---

## FILE 1: Dockerfile
## Location: ./Dockerfile

```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================================
# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
```

---

## FILE 2: requirements.txt
## Location: ./requirements.txt

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
requests==2.31.0
numpy==1.24.3
scikit-learn==1.3.2
scipy==1.11.4
prometheus-client==0.19.0
```

---

## FILE 3: kubernetes-deployment.yaml
## Location: ./k8s/deployment.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: unnayan-config
  namespace: production
data:
  DATABASE_HOST: "postgres-production.c.unnayan-ai.internal"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "unnayan_production"
  LOG_LEVEL: "INFO"
  ENVIRONMENT: "production"
---
apiVersion: v1
kind: Secret
metadata:
  name: unnayan-secrets
  namespace: production
type: Opaque
stringData:
  DATABASE_USER: "unnayan_app"
  DATABASE_PASSWORD: "CHANGE_THIS_TO_SECURE_PASSWORD_IN_PRODUCTION"
  JWT_SECRET_KEY: "CHANGE_THIS_TO_SECURE_JWT_SECRET"
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unnayan-rule-engine
  namespace: production
  labels:
    app: unnayan-rule-engine
    version: v1
spec:
  replicas: 3  # Horizontal scaling
  revisionHistoryLimit: 3
  
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: unnayan-rule-engine
  
  template:
    metadata:
      labels:
        app: unnayan-rule-engine
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8001"
        prometheus.io/path: "/metrics"
    
    spec:
      serviceAccountName: unnayan-app
      
      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      # Init container for DB migrations
      initContainers:
      - name: db-migration
        image: unnayan-ai/rule-engine:1.0.0
        imagePullPolicy: Always
        command: ["python", "migrate_db.py"]
        envFrom:
        - configMapRef:
            name: unnayan-config
        - secretRef:
            name: unnayan-secrets
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
      
      containers:
      - name: rule-engine
        image: unnayan-ai/rule-engine:1.0.0
        imagePullPolicy: Always
        
        ports:
        - containerPort: 8001
          name: http
          protocol: TCP
        
        env:
        - name: DATABASE_URL
          value: "postgresql://$(DATABASE_USER):$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
          valueFrom:
            secretKeyRef:
              name: unnayan-secrets
              key: DATABASE_PASSWORD
        
        envFrom:
        - configMapRef:
            name: unnayan-config
        - secretRef:
            name: unnayan-secrets
        
        # Resource limits
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1024Mi"
        
        # Liveness probe
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness probe
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        
        # Security context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        
        # Volume mounts
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /var/log
      
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      
      # Pod disruption budget
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - unnayan-rule-engine
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: unnayan-rule-engine
  namespace: production
  labels:
    app: unnayan-rule-engine
spec:
  type: ClusterIP
  
  selector:
    app: unnayan-rule-engine
  
  ports:
  - name: http
    port: 8001
    targetPort: 8001
    protocol: TCP
  
  sessionAffinity: None
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: unnayan-rule-engine-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: unnayan-rule-engine
  
  minReplicas: 3
  maxReplicas: 10
  
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: unnayan-rule-engine-pdb
  namespace: production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: unnayan-rule-engine
```

---

## FILE 4: PostgreSQL StatefulSet
## Location: ./k8s/postgres.yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: "fast-ssd"
  resources:
    requests:
      storage: 100Gi
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres
  replicas: 1
  
  selector:
    matchLabels:
      app: postgres
  
  template:
    metadata:
      labels:
        app: postgres
    
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        
        ports:
        - containerPort: 5432
          name: postgres
        
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: username
        
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: password
        
        - name: POSTGRES_DB
          value: "unnayan_production"
        
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        
        resources:
          requests:
            cpu: "2000m"
            memory: "4Gi"
          limits:
            cpu: "4000m"
            memory: "8Gi"
        
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U $POSTGRES_USER
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U $POSTGRES_USER
          initialDelaySeconds: 5
          periodSeconds: 5
  
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes:
      - ReadWriteOnce
      storageClassName: "fast-ssd"
      resources:
        requests:
          storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: production
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
    name: postgres
```

---

## FILE 5: RBAC Configuration
## Location: ./k8s/rbac.yaml

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: unnayan-app
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: unnayan-app-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: unnayan-app-binding
  namespace: production
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: unnayan-app-role
subjects:
- kind: ServiceAccount
  name: unnayan-app
  namespace: production
```

---

## FILE 6: Network Policy
## Location: ./k8s/network-policy.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: unnayan-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: unnayan-rule-engine
  
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8001
  
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53
  
  # Allow PostgreSQL
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  
  # Allow HTTPS outbound (for external APIs)
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

---

## FILE 7: Monitoring & Alerts
## Location: ./k8s/monitoring.yaml

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: unnayan-rule-engine
  namespace: production
spec:
  selector:
    matchLabels:
      app: unnayan-rule-engine
  endpoints:
  - port: http
    interval: 30s
    path: /metrics
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: unnayan-alerts
  namespace: production
spec:
  groups:
  - name: unnayan
    interval: 30s
    rules:
    # Rule Engine alerts
    - alert: RuleEngineHighErrorRate
      expr: rate(rule_validation_errors_total[5m]) > 0.05
      for: 5m
      annotations:
        summary: "High error rate in rule engine"
    
    - alert: RuleEngineLatencyHigh
      expr: histogram_quantile(0.95, rule_validation_duration_seconds) > 0.5
      for: 5m
      annotations:
        summary: "Rule engine p95 latency > 500ms"
    
    # Database alerts
    - alert: PostgreSQLDown
      expr: up{job="postgres"} == 0
      for: 1m
      annotations:
        summary: "PostgreSQL is down"
    
    - alert: PostgreSQLConnectionsHigh
      expr: pg_stat_activity_count > 80
      for: 5m
      annotations:
        summary: "PostgreSQL connections > 80"
    
    # Pod alerts
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 0.1
      for: 5m
      annotations:
        summary: "Pod crashing in production"
```

---

## FILE 8: Environment Configuration (.env)
## Location: ./.env.production

```bash
# Database
DATABASE_URL=postgresql://unnayan_app:CHANGE_THIS_PASSWORD@postgres-production.c.unnayan-ai.internal:5432/unnayan_production
DATABASE_POOL_SIZE=10
DATABASE_POOL_RECYCLE=3600

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO
DEBUG=false

# Security
JWT_SECRET_KEY=CHANGE_THIS_TO_SECURE_KEY_MIN_32_CHARS
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1

# API
API_HOST=0.0.0.0
API_PORT=8001
API_WORKERS=4

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=admin@unnayan-ai.com

# Monitoring
PROMETHEUS_PORT=8002
PROMETHEUS_ENABLED=true

# AWS (if using AWS)
AWS_REGION=ap-south-1
AWS_S3_BUCKET=unnayan-backups

# Feature Flags
ENABLE_DRIFT_DETECTION=true
ENABLE_BIAS_MONITORING=true
ENABLE_HUMAN_REVIEW_QUEUE=true
```

---

## DEPLOYMENT INSTRUCTIONS

### Prerequisites
```bash
# Install Docker
docker --version

# Install Kubernetes CLI
kubectl version --client

# Install Helm (optional)
helm version
```

### Step 1: Build Docker Image
```bash
docker build -t unnayan-ai/rule-engine:1.0.0 .
docker push unnayan-ai/rule-engine:1.0.0
```

### Step 2: Create Kubernetes Namespace
```bash
kubectl create namespace production
kubectl label namespace production name=production
```

### Step 3: Create Secrets
```bash
# PostgreSQL secrets
kubectl create secret generic postgres-secrets \
  --from-literal=username=unnayan_app \
  --from-literal=password=CHANGE_THIS_SECURE_PASSWORD \
  -n production

# Application secrets
kubectl create secret generic unnayan-secrets \
  --from-literal=DATABASE_PASSWORD=CHANGE_THIS_SECURE_PASSWORD \
  --from-literal=JWT_SECRET_KEY=CHANGE_THIS_MIN_32_CHARS \
  --from-literal=SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -n production
```

### Step 4: Deploy PostgreSQL
```bash
kubectl apply -f k8s/postgres.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n production --timeout=300s
```

### Step 5: Run Database Migrations
```bash
kubectl run --rm -i -t --image=unnayan-ai/rule-engine:1.0.0 --restart=Never \
  migrate --env="$(cat .env.production)" -- python migrate_db.py
```

### Step 6: Deploy Rule Engine
```bash
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/monitoring.yaml

# Check deployment status
kubectl rollout status deployment/unnayan-rule-engine -n production
```

### Step 7: Verify Deployment
```bash
# Check pods
kubectl get pods -n production

# Check logs
kubectl logs -f deployment/unnayan-rule-engine -n production

# Port-forward for testing
kubectl port-forward -n production svc/unnayan-rule-engine 8001:8001

# Test health endpoint
curl http://localhost:8001/health
```

### Step 8: Setup Monitoring
```bash
# Install Prometheus operator (if not already installed)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# Apply monitoring rules
kubectl apply -f k8s/monitoring.yaml
```

### Step 9: Configure CI/CD
```bash
# GitHub Actions, GitLab CI, or Jenkins pipeline
# Should trigger on: Push to main branch
# Pipeline should:
#   1. Run tests
#   2. Build Docker image
#   3. Push to registry
#   4. Deploy to Kubernetes
#   5. Run smoke tests
#   6. Rollback on failure
```

### Scaling
```bash
# Scale to 5 replicas
kubectl scale deployment unnayan-rule-engine --replicas=5 -n production

# HPA automatically scales between 3-10 replicas based on load
# CPU threshold: 70%
# Memory threshold: 80%
```

### Rollback
```bash
# View deployment history
kubectl rollout history deployment/unnayan-rule-engine -n production

# Rollback to previous version
kubectl rollout undo deployment/unnayan-rule-engine -n production

# Rollback to specific revision
kubectl rollout undo deployment/unnayan-rule-engine --to-revision=2 -n production
```

### Monitoring & Alerts
```bash
# Check HPA status
kubectl get hpa -n production

# Monitor metrics (if Prometheus installed)
kubectl port-forward -n monitoring svc/prometheus-server 9090:80

# View logs
kubectl logs -f deployment/unnayan-rule-engine -n production
```
