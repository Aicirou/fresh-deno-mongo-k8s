# Fresh Deno MongoDB Kubernetes

A modern, production-ready dinosaur API built with Fresh framework, Deno runtime, MongoDB backend, and Kubernetes orchestration.

[![Deploy](https://github.com/Aicirou/fresh-deno-mongo-k8s/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/Aicirou/fresh-deno-mongo-k8s/actions)

## 🚀 Quick Start

### Development
```bash
# Clone and start development server
git clone <repository-url>
cd fresh-deno-mongo-k8s
deno task dev
```
**Access**: http://localhost:5173

### Production Deployment  
```bash
# One-command deployment to Kubernetes
./scripts/deploy-full-stack.sh
```
**Access**: http://localhost:8080 (with port-forwarding)

## ✨ Features

### Fresh Framework Benefits
- **File-system Routing**: Automatic URL routing based on file structure  
- **Islands Architecture**: Selective client-side hydration for optimal performance
- **Server-Side Rendering**: Fast initial page loads with SEO benefits
- **Built-in Optimization**: Automatic code splitting and asset optimization

### API Endpoints
- `GET /` - Fresh UI homepage with server-side rendering
- `GET /health` - Health check with database connectivity status  
- `GET /api` - All dinosaurs with search capabilities
- `GET /api/:name` - Specific dinosaur lookup (case-insensitive)
- `GET /api/cluster-status` - Real-time Kubernetes cluster monitoring

### Database & Storage
- **MongoDB StatefulSet**: Persistent storage with automatic data seeding
- **700+ Dinosaur Records**: Pre-populated dataset for immediate functionality
- **Smart Fallback**: In-memory data when database unavailable
- **Connection Pooling**: Optimized database performance

### Kubernetes Features
- **Production-Ready**: Security contexts, RBAC, resource limits
- **Auto-Scaling**: HPA based on CPU/memory usage (2-10 replicas)
- **Health Monitoring**: Liveness and readiness probes
- **Rolling Updates**: Zero-downtime deployments
- **Persistent Storage**: MongoDB data survives pod restarts

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
```
│   Fresh UI      │    │   Deno Runtime   │    │   MongoDB       │
│ (Port 5173/8000)│◄──►│   + Services     │◄──►│  (StatefulSet)  │
│                 │    │                  │    │                 │
│ • Server-side   │    │ • Database Svc   │    │ • Persistent    │
│   rendering     │    │ • K8s monitoring │    │   storage       │
│ • Client islands│    │ • Health checks  │    │ • Auto-seeding  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Runtime**: Deno 2.3.7+ with TypeScript
- **Framework**: Fresh (file-system routing + islands)
- **Database**: MongoDB with persistent volumes
- **Orchestration**: Kubernetes with HPA and RBAC
- **Container**: Docker with security hardening

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - Local development setup and workflow
- **[Production Guide](PRODUCTION.md)** - Kubernetes deployment and operations
- **[Copilot Instructions](.github/copilot-instructions.md)** - AI development assistance

## 🛠️ Development

### Prerequisites
- [Deno](https://deno.land/) 2.3.7+
- [Docker](https://docker.com/) (for containers)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (for K8s)
- Local MongoDB OR minikube/kind

### Local Development
```bash
# Start Fresh development server with hot reload
deno task dev
# Access at: http://localhost:5173

# OR with helper script  
./scripts/dev.sh dev
```

### Quick Commands
```bash
# Development
./scripts/dev.sh dev          # Start dev server
./scripts/dev.sh test         # Run tests  
./scripts/dev.sh build        # Build Docker image

# Deployment  
./scripts/dev.sh deploy       # Deploy to K8s
./scripts/quick-access.sh     # Setup port-forwarding
```

## ☸️ Kubernetes Deployment

### Full Stack Deployment
```bash
# Deploy MongoDB + Fresh API + Services
./scripts/deploy-full-stack.sh

# Verify deployment
kubectl get pods,svc,pvc
```

### Access Methods
```bash
# Port-forwarding (development)
kubectl port-forward service/dinosaur-api-service 8080:80

# NodePort (direct cluster access)  
curl http://<NODE-IP>:30080

# Ingress (production with domain)
curl http://dinosaur-api.yourdomain.com
```

### Monitoring
```bash
# Application logs
kubectl logs -l app=dinosaur-api -f

# Resource usage
kubectl top pods -l app=dinosaur-api

# Cluster status via API
curl http://localhost:8080/api/cluster-status
```

## 🔧 Configuration

### Environment Variables
```bash
# Development (.env)
PORT=8000
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/dinosaurdb

# Production (K8s deployment)
NODE_ENV=production
MONGODB_URI=mongodb://admin:password@mongodb-service:27017/dinosaurdb?authSource=admin
ENABLE_CLUSTER_MONITORING=true
```

### Service Layer
- **Database Service**: MongoDB operations with fallback data
- **Kubernetes Service**: Cluster monitoring via kubectl
- **Configuration Service**: Environment-aware settings

## 🚦 CI/CD

GitHub Actions workflow provides:
- **Automated Testing**: Deno check, lint, format, tests
- **Container Building**: Multi-platform Docker images  
- **Staging Deployment**: Auto-deploy on `develop` branch
- **Production Deployment**: Auto-deploy on `main` branch

## 📈 Production Considerations

### Security
- Non-root container user (UID 1001)
- RBAC with minimal cluster permissions
- Security contexts and capability dropping
- Network policies (optional)

### Performance  
- Horizontal Pod Autoscaler (2-10 replicas)
- Resource requests and limits
- MongoDB connection pooling
- Fresh framework optimizations

### Reliability
- Health checks (liveness + readiness)
- Rolling update strategy
- Persistent storage for database
- Graceful shutdown handling

## 🆘 Troubleshooting

### Common Issues
```bash
# Port already in use
pkill -f "deno.*dev"

# MongoDB connection failed
kubectl logs -l app=mongodb
kubectl port-forward service/mongodb-service 27017:27017

# Pod not starting
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Debug Commands
```bash
# Development (Vite dev server)
curl http://localhost:5173/health
curl http://localhost:5173/api

# Production (K8s with port-forwarding)
curl http://localhost:8080/health
curl http://localhost:8080/api/cluster-status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fresh Framework](https://fresh.deno.dev/) - Modern web framework for Deno
- [Deno](https://deno.land/) - Secure runtime for JavaScript and TypeScript
- [MongoDB](https://mongodb.com/) - Document database
- [Kubernetes](https://kubernetes.io/) - Container orchestration
