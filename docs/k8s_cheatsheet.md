# Kubernetes Cheatsheet - Dinosaur API

Quick reference for managing the Dinosaur API on Kubernetes.

## 🚀 Quick Start Commands

### Deploy Everything
```bash
# Deploy all resources at once
kubectl apply -f k8s/

# Deploy individually (order matters for dependencies)
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml  # optional
```

### Verify Deployment
```bash
# Check all resources
kubectl get all -l app=dinosaur-api

# Check specific resources
kubectl get pods -l app=dinosaur-api
kubectl get svc dinosaur-api-service
kubectl get configmap dinosaur-data
kubectl get hpa dinosaur-api-hpa
```

## 📊 Monitoring & Status

### Pod Status & Logs
```bash
# Watch pods in real-time
kubectl get pods -l app=dinosaur-api -w

# Get detailed pod information
kubectl describe pod -l app=dinosaur-api

# View logs
kubectl logs -l app=dinosaur-api
kubectl logs -l app=dinosaur-api -f  # follow logs
kubectl logs -l app=dinosaur-api --previous  # previous container logs
kubectl logs deployment/dinosaur-api -c dinosaur-api  # specific container
```

### Service & Networking
```bash
# Check service endpoints
kubectl get endpoints dinosaur-api-service
kubectl describe service dinosaur-api-service

# Test internal connectivity
kubectl run debug --image=busybox -it --rm -- sh
# Inside debug pod:
wget -O- http://dinosaur-api-service/api
```

### Auto-Scaling Status
```bash
# Monitor HPA
kubectl get hpa dinosaur-api-hpa -w
kubectl describe hpa dinosaur-api-hpa

# Check resource usage
kubectl top pods -l app=dinosaur-api
kubectl top nodes
```

## 🔧 Development & Testing

### Local Access Methods
```bash
# Method 1: Port Forward (recommended for development)
kubectl port-forward service/dinosaur-api-service 8080:80
curl http://localhost:8080/api

# Method 2: NodePort (if using local cluster)
kubectl get svc dinosaur-api-nodeport
curl http://$(minikube ip):30080/api

# Method 3: Ingress (if configured)
curl http://dinosaur-api.local/api
```

### API Testing
```bash
# Test all endpoints
curl http://localhost:8080/                    # Health check
curl http://localhost:8080/api                 # All dinosaurs (large response!)
curl http://localhost:8080/api/triceratops     # Specific dinosaur
curl http://localhost:8080/api/TYRANNOSAURUS   # Case insensitive
curl http://localhost:8080/api/invalidname     # Not found test
```

### Configuration Updates
```bash
# Update ConfigMap data
kubectl patch configmap dinosaur-data --patch='{"data":{"data.json":"[{\"name\":\"Test\",\"description\":\"Updated\"}]"}}'

# Restart deployment to pick up ConfigMap changes
kubectl rollout restart deployment/dinosaur-api
kubectl rollout status deployment/dinosaur-api
```

## 🔄 Scaling & Updates

### Manual Scaling
```bash
# Scale replicas
kubectl scale deployment dinosaur-api --replicas=5
kubectl get pods -l app=dinosaur-api

# Scale down
kubectl scale deployment dinosaur-api --replicas=2
```

### Rolling Updates
```bash
# Update image (after building new version)
kubectl set image deployment/dinosaur-api dinosaur-api=dinosaur-api:v2

# Check rollout status
kubectl rollout status deployment/dinosaur-api
kubectl rollout history deployment/dinosaur-api

# Rollback if needed
kubectl rollout undo deployment/dinosaur-api
kubectl rollout undo deployment/dinosaur-api --to-revision=1
```

### Resource Updates
```bash
# Update resource limits
kubectl patch deployment dinosaur-api -p='{"spec":{"template":{"spec":{"containers":[{"name":"dinosaur-api","resources":{"limits":{"memory":"512Mi","cpu":"1000m"}}}]}}}}'
```

## 🔍 Debugging & Troubleshooting

### Common Issues & Solutions

#### Pods Not Starting
```bash
# Check pod status and events
kubectl describe pod -l app=dinosaur-api
kubectl get events --sort-by=.metadata.creationTimestamp

# Common causes:
# - Image not found: Check image name and registry
# - Resource constraints: Check node resources
# - ConfigMap missing: Verify configmap exists
```

#### Image Pull Errors
```bash
# For local development (minikube/kind)
docker build -t dinosaur-api:latest .
minikube image load dinosaur-api:latest  # minikube
kind load docker-image dinosaur-api:latest  # kind

# Check image pull policy
kubectl describe pod -l app=dinosaur-api | grep -A 5 "Image"
```

#### Service Not Accessible
```bash
# Check service and endpoints
kubectl get svc dinosaur-api-service
kubectl get endpoints dinosaur-api-service
kubectl describe service dinosaur-api-service

# If no endpoints, check pod labels
kubectl get pods -l app=dinosaur-api --show-labels

# Test service DNS
kubectl run debug --image=busybox -it --rm -- nslookup dinosaur-api-service
```

#### HPA Not Scaling
```bash
# Check metrics server
kubectl get pods -n kube-system | grep metrics-server

# Install metrics server if missing (minikube)
minikube addons enable metrics-server

# Check HPA status
kubectl describe hpa dinosaur-api-hpa
kubectl top pods -l app=dinosaur-api
```

### Performance Debugging
```bash
# Resource usage over time
kubectl top pods -l app=dinosaur-api --containers

# Detailed resource analysis
kubectl describe node
kubectl describe pod -l app=dinosaur-api | grep -A 10 "Limits\|Requests"

# Load testing (be careful in production!)
kubectl run load-test --image=busybox -it --rm -- sh
# Inside pod:
while true; do wget -O- http://dinosaur-api-service/api > /dev/null; done
```

## 🧹 Cleanup Commands

### Partial Cleanup
```bash
# Remove just the deployment
kubectl delete deployment dinosaur-api

# Remove services
kubectl delete service dinosaur-api-service dinosaur-api-nodeport

# Remove HPA
kubectl delete hpa dinosaur-api-hpa
```

### Complete Cleanup
```bash
# Remove all resources at once
kubectl delete -f k8s/

# Or delete by label
kubectl delete all,configmap,hpa -l app=dinosaur-api

# Verify cleanup
kubectl get all -l app=dinosaur-api
```

## 🛡️ Security & Production Tips

### Security Checks
```bash
# Check security contexts
kubectl describe pod -l app=dinosaur-api | grep -A 10 "Security Context"

# Verify non-root user
kubectl exec -it $(kubectl get pod -l app=dinosaur-api -o name | head -1) -- id

# Check for privileged containers
kubectl get pods -l app=dinosaur-api -o jsonpath='{.items[*].spec.containers[*].securityContext}'
```

### Production Readiness
```bash
# Check resource limits are set
kubectl describe pod -l app=dinosaur-api | grep -A 5 "Limits\|Requests"

# Verify health checks
kubectl describe pod -l app=dinosaur-api | grep -A 5 "Liveness\|Readiness"

# Check update strategy
kubectl describe deployment dinosaur-api | grep -A 5 "Strategy"
```

## 📋 Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Kubernetes aliases for this project
alias k='kubectl'
alias kdapi='kubectl get pods -l app=dinosaur-api'
alias klogapi='kubectl logs -l app=dinosaur-api'
alias kdescapi='kubectl describe pod -l app=dinosaur-api'
alias kpfapi='kubectl port-forward service/dinosaur-api-service 8080:80'
alias khpaapi='kubectl get hpa dinosaur-api-hpa'

# Quick deployment commands
alias kdelapi='kubectl delete -f k8s/'
alias kapplyapi='kubectl apply -f k8s/'
alias krestartapi='kubectl rollout restart deployment/dinosaur-api'
```

## 🔗 Related Commands

### Docker Integration
```bash
# Build and load for local K8s
docker build -t dinosaur-api:latest .
minikube image load dinosaur-api:latest  # for minikube
kind load docker-image dinosaur-api:latest  # for kind

# Check loaded images
minikube image ls | grep dinosaur-api
```

### Namespace Management
```bash
# If using custom namespace
kubectl create namespace dinosaur-demo
kubectl apply -f k8s/ -n dinosaur-demo
kubectl get all -n dinosaur-demo -l app=dinosaur-api
```

---

💡 **Pro Tip**: Always use labels (`-l app=dinosaur-api`) to filter resources specific to this application, especially in shared clusters!