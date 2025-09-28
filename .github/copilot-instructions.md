````instructions
# Copilot Instructions - Fresh Deno MongoDB Kubernetes

This project is a **modern, production-ready dinosaur API** built with Fresh framework, Deno runtime, MongoDB backend, and Kubernetes orchestration. The Express app has been completely removed - this is now a **Fresh-only application**.

## Architecture Overview

**Modern Full-Stack Pattern**:
- **Fresh Framework**: File-system routing + islands architecture for optimal performance
- **Single Application**: Unified codebase at root level (no dual-app complexity)
- **Deno Runtime**: TypeScript-first with built-in tooling and security
- **MongoDB StatefulSet**: Persistent database with auto-seeding from JSON data
- **Kubernetes-Ready**: Production deployment with HPA, RBAC, and security contexts

## Key File Structure & Responsibilities

```
fresh-deno-mongo-k8s/          # 🦕 Fresh Application (Root Level)
├── main.ts                    # Fresh app entry point with clean middleware stack
├── data.json                  # 700+ dinosaur records for MongoDB seeding
├── deno.json                  # Fresh + MongoDB + TypeScript configuration
├── Dockerfile                 # Production container with security hardening
├── routes/                    # 📁 File-system routing (Fresh pattern)
│   ├── index.tsx              # Homepage with server-side rendering
│   └── api/                   # API endpoints via Fresh routing
│       ├── dinosaurs.tsx      # GET /api/dinosaurs
│       ├── cluster-status.tsx # GET /api/cluster-status  
│       └── health.tsx         # GET /api/health
├── islands/                   # 🏝️ Client-side interactive components
│   ├── DinosaurBrowser.tsx    # Main search interface with real-time filtering
│   └── ClusterStatus.tsx      # Live Kubernetes monitoring dashboard
├── components/                # 🧩 Server-side UI components
│   └── DinosaurCard.tsx       # Reusable dinosaur display component
├── services/                  # 🛠️ Business logic layer (Clean Architecture)
│   ├── database.ts            # MongoDB operations with fallback data
│   └── kubernetes.ts          # Cluster monitoring via kubectl commands
├── config/                    # ⚙️ Global environment management
│   └── env.ts                 # Centralized config with dev/prod separation
├── utils/                     # 🔧 Utilities and helpers
│   └── logger.ts              # Clean logging with level-based filtering
├── types/                     # 📝 TypeScript definitions (shared interfaces)
│   └── index.ts               # Dinosaur, ClusterStatus, ApiResponse types

k8s/                           # ☸️ Kubernetes Infrastructure
├── mongodb.yaml               # 🆕 StatefulSet with persistent storage + secrets
├── deployment.yaml            # Multi-replica API with health checks + RBAC
├── service.yaml               # ClusterIP + NodePort for API access
├── rbac.yaml                  # 🆕 ServiceAccount for cluster monitoring
├── hpa.yaml                   # Horizontal Pod Autoscaler
├── configmap.yaml             # Legacy: Data ConfigMap (fallback)
└── ingress.yaml               # External access routing

scripts/                       # 🛠️ Development Automation
├── deploy-full-stack.sh       # 🆕 Complete deployment (MongoDB + API)
├── deploy.sh                  # API-only deployment (legacy)
├── dev.sh                     # Enhanced multi-command helper
├── port-forward.sh            # 🆕 Advanced port forwarding with monitoring
└── quick-access.sh            # 🆕 Quick setup and connectivity testing
```

## Critical Development Patterns

### Fresh Framework Architecture
- **Single Application**: Unified codebase with Fresh framework handling both UI and API
- **File-system Routing**: `routes/api/dinosaurs.tsx` automatically serves `/api/dinosaurs`
- **Islands Architecture**: Selective client-side hydration (DinosaurBrowser, ClusterStatus)
- **Server-Side Rendering**: Fast initial page loads with SEO benefits

### Deno-Specific Approaches  
- **Development**: `deno task dev` → Fresh dev server with hot module reloading
- **Production**: Direct execution via `deno run --allow-* main.ts`
- **Imports**: Modern JSR + npm pattern:
  - Fresh: `"fresh": "jsr:@fresh/core@^2.1.1"`
  - UI: `"preact": "npm:preact@^10.27.2"`, `"@preact/signals": "npm:@preact/signals@^2.3.1"`
  - Database: `"mongodb": "npm:mongodb@^6.3.0"`

### Database Integration Strategy
- **Production**: MongoDB StatefulSet with persistent volumes and secrets
- **Development**: Auto-seeding from `data.json` on first connection
- **Fallback**: Fresh UI uses in-memory data when MongoDB unavailable (Vite compatibility)
- **Service Layer**: Abstracted database operations in `services/database.ts`
- **Connection**: `MONGODB_URI` environment variable for cluster connection string

### Fresh Framework Patterns
- **File-system routing**: `routes/api/dinosaurs.tsx` → `/api/dinosaurs` endpoint
- **Islands**: `islands/DinosaurBrowser.tsx` → client-side interactive component
- **SSR + Hydration**: Pages render server-side, islands hydrate client-side
- **Middleware stack**: CORS, database initialization, request logging in `main.ts`
- **Type safety**: Shared TypeScript interfaces in `types/index.ts`

### Container Build Strategy  
- **Base Image**: `denoland/deno:2.3.7` (pinned for reproducibility)
- **Kubectl inclusion**: Installed for cluster monitoring features (80MB layer)
- **Multi-stage caching**: Dependencies cached before source code copy
- **Security**: Non-root user (UID 1001), dropped capabilities, read-only file system
- **Health Check**: HTTP-based using Deno's fetch API on port 8000

## Kubernetes Deployment Patterns

### Full-Stack Service Architecture
```yaml
# MongoDB StatefulSet Pattern
mongodb (StatefulSet):           Persistent database with PVC
mongodb-service (ClusterIP):     Internal database access  
mongodb-headless (Headless):     Direct pod access for StatefulSet

# API Service Pattern  
dinosaur-api (Deployment):       3 replicas with rolling updates
dinosaur-api-service (ClusterIP): Internal API access
dinosaur-api-nodeport (NodePort): External access on port 30080
```

### RBAC Security Model
```yaml
# Service Account with limited cluster access
ServiceAccount: dinosaur-api-sa
ClusterRole: dinosaur-api-reader  # pods, services, deployments, hpa (read-only)
ClusterRoleBinding: Links SA to role for cluster monitoring
```

### Resource Management & Scaling
- **API Replicas**: 3 for HA, HPA scales 2-10 based on CPU (70%) and memory (80%)
- **MongoDB**: Single replica StatefulSet with 1Gi persistent storage
- **Resource Limits**: API (256Mi/500m), MongoDB (512Mi/500m)
- **Security Context**: Non-root users, dropped capabilities, privilege escalation disabled

### Data Persistence Strategy
```yaml
# Modern: MongoDB with persistent storage
volumeClaimTemplates:
- metadata: { name: mongodb-data }
  spec: { accessModes: [ReadWriteOnce], resources: { requests: { storage: 1Gi }}}

# Legacy: ConfigMap fallback (retained for compatibility)
volumeMounts:
- name: dinosaur-data
  mountPath: /app/data.json
  subPath: data.json
  readOnly: true
```

## Essential Development Workflows

### Full-Stack Development (Recommended)
```bash
# Complete deployment with MongoDB + API + UI
./scripts/deploy-full-stack.sh          # 🆕 One-command full stack deployment
./scripts/dev.sh deploy-full             # Same via dev helper
./scripts/dev.sh ui                      # 🆕 Opens Fresh UI in browser (localhost:8080/ui)

# Development workflows
./scripts/dev.sh dev                     # Express API local development
cd fresh-dinosaurs && deno task dev     # 🆕 Fresh UI development with HMR
./scripts/dev.sh test                    # Run test suite
./scripts/dev.sh build                   # Build Docker image
```

### Advanced Port Forwarding (New)
```bash
./scripts/port-forward.sh                # 🆕 Enhanced port forwarding with monitoring
./scripts/quick-access.sh                # 🆕 Quick setup + connectivity test

# Manual port forwarding options
kubectl port-forward service/dinosaur-api-service 8080:80      # API access
kubectl port-forward service/mongodb-service 27017:27017       # Direct MongoDB access
```

### Local Development Options
```bash
# Express API (Traditional)
cd tutorial-with-express
deno task dev                           # Express server on localhost:8000
curl localhost:8000/api/cluster-status  # Test cluster monitoring

# Fresh UI (Modern)  
cd tutorial-with-express/fresh-dinosaurs
deno task dev                           # Vite dev server with HMR
# Access: http://localhost:8000/ (Fresh UI with islands)

# Database operations
cd tutorial-with-express
deno task seed                          # Seed MongoDB with dinosaur data
```

### Container & K8s Workflows
```bash
# Legacy API-only deployment
./scripts/deploy.sh                     # Build & deploy API only
kubectl apply -f k8s/configmap.yaml     # Deploy legacy ConfigMap data

# Full infrastructure
kubectl apply -f k8s/mongodb.yaml       # Deploy MongoDB StatefulSet
kubectl apply -f k8s/rbac.yaml          # Deploy RBAC for cluster monitoring
kubectl apply -f k8s/deployment.yaml    # Deploy API with MongoDB connection
kubectl apply -f k8s/                   # Deploy everything

# Monitoring & debugging
./scripts/dev.sh status                  # Comprehensive status check
./scripts/dev.sh logs                    # Follow all application logs
kubectl logs -l app=mongodb -f          # MongoDB logs
kubectl get pods,svc,pvc                # Full resource overview
```

## Project-Specific Conventions

### API Endpoint Architecture
**Express API** (`/tutorial-with-express/main.ts`):
- `GET /`: Welcome message + health status with MongoDB connectivity
- `GET /api`: Returns ALL dinosaurs from MongoDB (auto-seeded from data.json)
- `GET /api/:name`: Case-insensitive search against MongoDB collection

**Fresh UI API Routes** (`/fresh-dinosaurs/routes/api/`):
- `GET /api/cluster-status`: Real-time Kubernetes monitoring (requires RBAC)  
- `GET /api/dinosaurs`: Dinosaur data with search/pagination (fallback to in-memory)
- `GET /api/health`: Comprehensive health check (API + DB + cluster)
- `GET /`: Main UI page with server-side rendering
- `GET /ui`: Alternative UI access point

### Service Layer Patterns
- **Database Service** (`services/database.ts`): MongoDB operations with fallback data
- **Kubernetes Service** (`services/kubernetes.ts`): Cluster monitoring via kubectl commands
- **Separation of Concerns**: Business logic abstracted from route handlers
- **Error Boundaries**: Graceful degradation when services unavailable

### Fresh Framework Conventions
- **Islands Architecture**: Client-side components in `/islands/` (DinosaurBrowser, ClusterStatus)
- **File-system Routing**: `/routes/api/dinosaurs.tsx` automatically serves `/api/dinosaurs`
- **Middleware Stack**: CORS → Database Init → Request Logging in main.ts
- **TypeScript Integration**: Shared types in `/types/index.ts`, JSX with Preact

### Configuration & Environment
- **MongoDB**: `MONGODB_URI` environment variable for cluster connection
- **Port**: Configurable via `PORT` env var, defaults to 8000
- **Development**: Local fallback data when MongoDB unavailable  
- **Production**: Auto-seeding on first startup, persistent MongoDB storage

### Debugging Approaches
```bash
# Enhanced diagnostics using new helper scripts
./scripts/dev.sh status                 # Overall deployment health (API + MongoDB)
./scripts/dev.sh logs                   # Follow application logs with filtering
./scripts/quick-access.sh               # 🆕 Quick connectivity test + endpoint validation
./scripts/port-forward.sh               # 🆕 Advanced port forwarding with connection monitoring

# Full-stack debugging commands
kubectl logs -l app=dinosaur-api -f     # API application logs (includes seeding process)
kubectl logs -l app=mongodb -f          # MongoDB logs (StatefulSet)
kubectl describe pod <pod-name>         # Pod details with events
kubectl get events --sort-by=.metadata.creationTimestamp  # Recent cluster events

# Service connectivity testing
kubectl get endpoints                   # All service endpoints
kubectl describe svc dinosaur-api-service  # Service details with endpoints
curl <minikube-ip>:30080/api/cluster-status  # Direct NodePort access test

# Database debugging
kubectl port-forward svc/mongodb-service 27017:27017  # Direct MongoDB access
mongosh mongodb://admin:password@localhost:27017/dinosaurdb  # Database connection

# Resource monitoring
kubectl top pods                        # Resource usage across all pods
kubectl describe hpa dinosaur-api-hpa   # Auto-scaling status and metrics
kubectl get pvc                        # Persistent volume claims (MongoDB storage)

# Comprehensive troubleshooting reference: docs/k8s_cheatsheet.md
```

## Integration Points & External Dependencies

### External Service Dependencies
- **MongoDB**: StatefulSet with persistent storage (not external - runs in cluster)
- **Kubernetes API**: RBAC-enabled cluster monitoring via kubectl in containers
- **Docker Registry**: Local image loading for minikube/kind development clusters
- **No external APIs**: Fully self-contained microservices architecture

### Cross-Component Communication Patterns
- **API → MongoDB**: Direct connection via `mongodb-service:27017` with authentication
- **Fresh UI → Express API**: Can call Express endpoints or implement own via file-system routing  
- **Pods → K8s API**: RBAC service account for cluster status monitoring
- **HPA → Deployment**: CPU/memory metrics for automatic scaling (2-10 replicas)
- **StatefulSet → PVC**: Persistent volume claims for MongoDB data persistence
- **Services → Pods**: Label selectors (`app: dinosaur-api`, `app: mongodb`)

### Enhanced Script System
- **`scripts/deploy-full-stack.sh`**: 🆕 Complete infrastructure deployment
  - MongoDB StatefulSet → API deployment → service verification
  - Auto-waits for MongoDB readiness before API deployment
  - Comprehensive status reporting and next-steps guidance

- **`scripts/dev.sh`**: Enhanced multi-purpose helper (20+ commands)
  - `deploy-full`: Full-stack deployment shortcut
  - `ui`: Opens Fresh UI in browser automatically  
  - Advanced error handling with colored output and dependency checking
  - Supports: dev, build, test, deploy, clean, status, logs, port-forward, restart, ui, help

- **`scripts/port-forward.sh`**: 🆕 Advanced port forwarding utility
  - Automatic cleanup of existing port forwards
  - Connection testing and monitoring
  - Multiple access method documentation

- **`scripts/quick-access.sh`**: 🆕 Rapid development setup
  - Checks existing port forwards, starts if needed
  - API connectivity testing with endpoint validation
  - Cluster status verification

### Documentation Structure  
- **`docs/k8s_cheatsheet.md`**: Comprehensive kubectl reference with troubleshooting commands
- **`docs/PSEUDO_CODE.md`**: Simplified architecture overview and concepts
- **`scripts/README.md`**: 🆕 Port forwarding and access utilities documentation
- **`.github/copilot-instructions.md`**: This file - comprehensive AI agent guidance

### Technology Integration Notes
- **Fresh + MongoDB**: UI uses fallback in-memory data due to Vite/MongoDB compatibility issues
- **RBAC Security**: Cluster monitoring requires `dinosaur-api-sa` service account with read permissions
- **kubectl in Container**: 80MB layer added to enable cluster status API endpoints
- **Dual Runtime Pattern**: Both Express and Fresh apps run on same Deno runtime with different configs

### Production Evolution Path
- ✅ **Database**: Evolved from ConfigMap JSON to MongoDB StatefulSet with persistence
- ✅ **Security**: RBAC implemented for cluster monitoring, security contexts enforced
- ✅ **Monitoring**: Real-time cluster status dashboard in Fresh UI
- ⚠️ **CI/CD**: Scripts optimized for development; production needs pipeline automation
- ⚠️ **Observability**: Health checks implemented; needs Prometheus/Grafana integration
- ⚠️ **Networking**: Ingress configured; production needs network policies and TLS

### AI Agent Quick Start
1. **Architecture**: Single Fresh application with MongoDB backend and K8s orchestration
2. **Key Commands**: `deno task dev` (development) → `./scripts/deploy-full-stack.sh` (production)
3. **Development**: Fresh dev server at `:8000` with hot reload and islands hydration
4. **Debugging**: `./scripts/dev.sh status` for K8s overview, `kubectl logs -l app=dinosaur-api -f` for app logs
5. **Data Flow**: MongoDB (persistent) ↔ Fresh routes/islands ↔ Clean UI components
6. **Port-forwarding**: Default enabled - `kubectl port-forward service/dinosaur-api-service 8080:80`

````
