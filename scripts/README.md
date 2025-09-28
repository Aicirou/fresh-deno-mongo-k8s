# 🦕 Dinosaur API Access Scripts

This directory contains utility scripts for easy access to the Dinosaur API running in Kubernetes.

## Scripts

### `port-forward.sh`
**Full-featured port forwarding with monitoring**

Sets up automatic port forwarding and keeps it running with detailed status information.

```bash
./scripts/port-forward.sh
```

**Features:**
- Automatic cleanup of existing port forwards
- Connection testing
- Detailed access URLs
- Keeps running until Ctrl+C
- Shows both localhost and NodePort access methods

### `quick-access.sh`
**Quick setup and status check**

Lightweight script for quick port forwarding setup and API testing.

```bash
./scripts/quick-access.sh
```

**Features:**
- Checks if port forwarding is already running
- Starts port forwarding if needed
- Tests API connectivity
- Shows available endpoints
- Quick cluster status test

## Access Methods

### 1. Port Forward (Recommended for Development)
```bash
# Run the quick access script
./scripts/quick-access.sh

# Then access:
curl http://localhost:8000/api/cluster-status
```

### 2. NodePort (Direct cluster access)
```bash
# Get minikube IP
minikube ip  # Example: 192.168.49.2

# Access directly
curl http://192.168.49.2:30080/api/cluster-status
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Health check |
| `/api` | List all dinosaurs |
| `/api/dinosaurs` | List all dinosaurs |
| `/api/cluster-status` | **Real-time Kubernetes cluster status** |
| `/api/:dinosaur` | Get specific dinosaur by name |
| `/ui` | Web UI interface |

## Examples

### Test Cluster Status
```bash
# Via port forward
curl -s http://localhost:8000/api/cluster-status | jq

# Via NodePort  
curl -s http://192.168.49.2:30080/api/cluster-status | jq
```

### Test Health
```bash
curl http://localhost:8000/health
# Returns: Welcome to the Dinosaur API! 🦕
```

## Troubleshooting

### Port forwarding not working?
```bash
# Kill existing port forwards
pkill -f "kubectl port-forward.*8000"

# Run quick access again
./scripts/quick-access.sh
```

### Check if pods are running
```bash
kubectl get pods -l app=dinosaur-api
```

### Check services
```bash
kubectl get services -l app=dinosaur-api
```
