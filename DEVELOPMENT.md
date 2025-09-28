# Development Guide

## Quick Start

### Prerequisites
- [Deno](https://deno.land/) 2.3.7+
- [Docker](https://docker.com/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) configured with your cluster
- [MongoDB](https://mongodb.com/) (local) OR minikube/kind for full K8s stack

### Local Development

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd fresh-deno-mongo-k8s
```

#### 2. Environment Configuration
Create `.env` file (optional - uses smart defaults):
```bash
# Development settings (optional - smart defaults)
PORT=8000
HOST=localhost
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/dinosaurdb
```

#### 3. Start Development Server
```bash
# Fresh development server with hot reload
deno task dev

# OR using helper script
./scripts/dev.sh dev
```

Access your application:
- **Fresh UI**: http://localhost:5173 (Vite dev server)
- **API**: http://localhost:5173/api
- **Health**: http://localhost:5173/health

> **Note**: Fresh uses Vite for development (port 5173) and serves on port 8000 in production

### Database Setup

#### Option 1: Local MongoDB (Recommended for Pure Development)
```bash
# Install and start MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# OR
sudo apt-get install mongodb                 # Ubuntu

# Start MongoDB
mongod --dbpath ~/data/db

# The app will auto-seed on first run
```

#### Option 2: Kubernetes MongoDB (Development with Production Parity)
```bash
# Deploy just MongoDB
kubectl apply -f k8s/mongodb.yaml

# Port-forward for local access
kubectl port-forward service/mongodb-service 27017:27017 &

# Update your .env
MONGODB_URI=mongodb://admin:password@localhost:27017/dinosaurdb?authSource=admin
```

### Development Workflow

#### Basic Commands
```bash
# Start development server
./scripts/dev.sh dev

# Run tests
./scripts/dev.sh test

# Build Docker image
./scripts/dev.sh build

# Deploy to local K8s
./scripts/dev.sh deploy
```

#### Port Forwarding (Automatic for Development)
```bash
# Quick setup with automatic port forwarding
./scripts/quick-access.sh

# Advanced port forwarding with monitoring
./scripts/port-forward.sh
```

### Development Features

#### Hot Reload
Fresh automatically reloads on file changes. No restart needed.

#### Debug Logging
Development mode enables detailed logging:
```bash
LOG_LEVEL=debug deno task dev
```

#### Local vs K8s Development  
```bash
# Pure local (fastest)
MONGODB_URI=mongodb://localhost:27017/dinosaurdb deno task dev

# K8s MongoDB (production parity)
kubectl port-forward service/mongodb-service 27017:27017 &
MONGODB_URI=mongodb://admin:password@localhost:27017/dinosaurdb?authSource=admin deno task dev
```

## Architecture Overview

### Fresh Framework
- **File-system routing**: `routes/` directory maps to URLs
- **Islands**: Client-side interactive components in `islands/`  
- **Server-side rendering**: Pages render on server, islands hydrate client-side
- **Built-in optimization**: Automatic code splitting and optimization

### Project Structure
```
fresh-deno-mongo-k8s/
├── routes/                 # File-system routing
│   ├── index.tsx          # Homepage (/)
│   └── api/               # API endpoints
├── islands/               # Client-side components  
├── components/            # Server-side components
├── services/              # Business logic layer
├── config/                # Environment configuration
├── utils/                 # Utilities and helpers
└── k8s/                   # Kubernetes manifests
```

### Service Layer Pattern
- **Database Service**: `services/database.ts` - MongoDB operations
- **Kubernetes Service**: `services/kubernetes.ts` - Cluster monitoring
- **Clean separation**: Business logic separated from routes

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill existing processes
pkill -f "deno.*dev"
lsof -ti:8000 | xargs kill -9
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
mongosh mongodb://localhost:27017/dinosaurdb

# For K8s MongoDB
kubectl logs -l app=mongodb
kubectl port-forward service/mongodb-service 27017:27017
```

#### Fresh Build Issues
```bash
# Clear Deno cache 
deno cache --reload deno.json

# Restart development server
./scripts/dev.sh dev
```

### Debug Commands
```bash
# Check application health
curl http://localhost:5173/health

# View detailed logs
LOG_LEVEL=debug deno task dev

# Database connection test
curl http://localhost:5173/api

# Cluster status (requires kubectl - expected to fail in local dev)
curl http://localhost:5173/api/cluster-status
```

### Expected Development Behavior
- **kubectl not found**: Normal in local development - cluster monitoring features are for K8s deployment
- **MongoDB fallback**: Uses in-memory data when MongoDB not available
- **Port 5173**: Vite dev server port (production uses 8000)

### Development Tips

1. **Use VSCode** with Deno extension for best experience
2. **Enable format on save** for consistent code style  
3. **Use the dev helper script** for common tasks
4. **Keep MongoDB running** for database features
5. **Use port-forwarding scripts** for K8s development

### Next Steps
- See [Production Guide](PRODUCTION.md) for deployment
- Check [API Documentation](docs/) for endpoint details
- Review [K8s Cheatsheet](docs/k8s_cheatsheet.md) for cluster commands
