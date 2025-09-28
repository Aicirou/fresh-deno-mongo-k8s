# 🦕 Minimalist Dinosaur API

A super simple Deno HTTP server with Docker and Kubernetes support.

## Features

- **Zero dependencies** - Pure Deno standard library
- **Single file app** - Everything in `main.minimal.ts`
- **Built-in web UI** - Interactive API explorer
- **Docker ready** - Minimal 50MB image
- **Kubernetes ready** - Simple deployment manifests
- **Health checks** - Built-in monitoring endpoints

## Quick Start

### Local Development

```bash
# Run directly
deno run --allow-net --allow-read --allow-env main.minimal.ts

# Or use task runner
deno task -c deno.minimal.json dev
```

Visit: http://localhost:8000

### Docker

```bash
# Build image
docker build -f Dockerfile.minimal -t dinosaur-api:minimal .

# Run container
docker run -p 8000:8000 dinosaur-api:minimal
```

### Kubernetes

```bash
# Deploy to cluster
./scripts/deploy.minimal.sh

# Access via port-forward
kubectl port-forward service/dinosaur-api-service 8080:80
```

Visit: http://localhost:8080

## API Endpoints

- `GET /` - Interactive web UI  
- `GET /health` - Health check
- `GET /api/dinosaurs` - List all dinosaurs
- `GET /api/dinosaurs/{id}` - Get specific dinosaur

## File Structure

```
.
├── main.minimal.ts           # Complete app in one file
├── Dockerfile.minimal        # Minimal Docker setup  
├── deno.minimal.json         # Minimal Deno config
├── scripts/
│   └── deploy.minimal.sh     # One-command deployment
└── k8s/
    ├── deployment.minimal.yaml
    ├── service.minimal.yaml
    └── ingress.minimal.yaml
```

## What's Different?

This minimalist version removes:
- ❌ MongoDB dependency
- ❌ Fresh framework complexity
- ❌ React/Preact components
- ❌ Complex routing system
- ❌ Kubernetes monitoring
- ❌ Multiple configuration files
- ❌ Build pipeline complexity

And keeps:
- ✅ HTTP API functionality
- ✅ Web interface
- ✅ Docker containerization
- ✅ Kubernetes deployment
- ✅ Health monitoring
- ✅ CORS support

## Resource Usage

- **Container**: ~50MB (vs ~200MB+ complex version)
- **Memory**: 64MB request, 128MB limit
- **CPU**: 50m request, 100m limit
- **Dependencies**: Zero external packages

## Development

The entire application logic is contained in `main.minimal.ts` - edit this single file to modify functionality.

For the full-featured version, see the original files without `.minimal` suffix.
