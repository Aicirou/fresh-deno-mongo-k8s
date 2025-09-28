# Production Deployment Guide

## Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or self-managed)
- `kubectl` configured with cluster access
- Docker registry access (or local image loading for development clusters)
- Sufficient cluster resources (2 CPU cores, 4GB RAM minimum)

## Quick Production Deployment

### 1. Build and Deploy
```bash
# Full stack deployment (MongoDB + Fresh API)
./scripts/deploy-full-stack.sh
```

This single command will:
- Build the Docker image (`fresh-dinosaur-api:latest`)
- Deploy MongoDB StatefulSet with persistent storage
- Deploy the Fresh API with 3 replicas
- Configure horizontal pod autoscaling
- Set up services and ingress
- Enable port-forwarding for immediate access

### 2. Verify Deployment
```bash
# Check all resources
kubectl get pods,svc,pvc,hpa

# Check application health
kubectl port-forward service/dinosaur-api-service 8080:80 &
curl http://localhost:8080/health
```

### 3. Access Application
```bash
# Port-forward (development/testing)
kubectl port-forward service/dinosaur-api-service 8080:80
# Open: http://localhost:8080

# NodePort (cluster access)
kubectl get nodes -o wide  # Get node IP
# Access: http://<NODE-IP>:30080

# Ingress (production)
# Configure DNS: dinosaur-api.yourdomain.com
# Access: http://dinosaur-api.yourdomain.com
```

## Production Configuration

### Environment Variables
The application uses production-optimized defaults when `NODE_ENV=production`:

```yaml
env:
- name: NODE_ENV
  value: "production"
- name: LOG_LEVEL  
  value: "info"                # Reduced logging
- name: PORT
  value: "8000"
- name: HOST
  value: "0.0.0.0"            # Accept all connections
- name: MONGODB_URI
  value: "mongodb://admin:password@mongodb-service:27017/dinosaurdb?authSource=admin"
- name: ENABLE_CLUSTER_MONITORING
  value: "true"               # Enable K8s monitoring features
```

### Resource Allocation

#### API Pods
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

#### MongoDB
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Security Configuration

#### RBAC (Role-Based Access Control)
```yaml
# Service account with minimal cluster permissions
ServiceAccount: dinosaur-api-sa
ClusterRole: dinosaur-api-reader  # Read-only access to pods, services, deployments
```

#### Pod Security
```yaml
securityContext:
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  capabilities:
    drop: [ALL]
```

#### Network Policies (Optional)
```yaml
# Restrict pod-to-pod communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dinosaur-api-network-policy
spec:
  podSelector:
    matchLabels:
      app: dinosaur-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: ingress-controller
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mongodb
```

## Scaling and High Availability

### Horizontal Pod Autoscaler
```yaml
# Automatic scaling: 2-10 replicas based on CPU/Memory
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 80
```

### Database High Availability
```yaml
# MongoDB StatefulSet with persistent storage
replicas: 1  # Single instance (upgrade to replica set for HA)
volumeClaimTemplates:
- metadata:
    name: mongodb-data
  spec:
    accessModes: [ReadWriteOnce]
    resources:
      requests:
        storage: 1Gi  # Increase for production
```

### Rolling Updates
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 1
```

## Monitoring and Observability

### Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 15
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Logging
```bash
# Application logs
kubectl logs -l app=dinosaur-api -f

# MongoDB logs  
kubectl logs -l app=mongodb -f

# System events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Metrics Collection
```bash
# Resource usage
kubectl top pods -l app=dinosaur-api
kubectl top nodes

# HPA status
kubectl describe hpa dinosaur-api-hpa
```

## Backup and Recovery

### Database Backup
```bash
# MongoDB dump
kubectl exec -it mongodb-0 -- mongodump --uri="mongodb://admin:password@localhost:27017/dinosaurdb?authSource=admin" --out=/tmp/backup

# Copy backup from pod
kubectl cp mongodb-0:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Persistent Volume Management
```bash
# List persistent volumes
kubectl get pv,pvc

# Backup persistent volume (cloud provider specific)
# Example for GKE:
gcloud compute disks snapshot <disk-name> --snapshot-names=dinosaur-db-backup-$(date +%Y%m%d)
```

## Production Operations

### Deployment Updates
```bash
# Build new image
docker build -t fresh-dinosaur-api:v2.0.0 .

# Update deployment
kubectl set image deployment/dinosaur-api dinosaur-api=fresh-dinosaur-api:v2.0.0

# Monitor rollout
kubectl rollout status deployment/dinosaur-api

# Rollback if needed
kubectl rollout undo deployment/dinosaur-api
```

### Database Operations
```bash
# Connect to MongoDB
kubectl port-forward service/mongodb-service 27017:27017 &
mongosh mongodb://admin:password@localhost:27017/dinosaurdb

# Database maintenance
kubectl exec -it mongodb-0 -- mongo --eval "db.adminCommand('listCollections')"
```

### Performance Tuning
```bash
# Increase resources if needed
kubectl patch deployment dinosaur-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"dinosaur-api","resources":{"limits":{"memory":"512Mi","cpu":"1000m"}}}]}}}}'

# Scale replicas manually
kubectl scale deployment dinosaur-api --replicas=5
```

## Security Best Practices

### 1. Image Security
- Use specific image tags (not `:latest`)
- Scan images for vulnerabilities
- Use minimal base images
- Run as non-root user

### 2. Network Security
- Implement network policies
- Use TLS for all external communication
- Restrict ingress to necessary ports only

### 3. Secrets Management
```yaml
# Use Kubernetes secrets instead of plain text
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-credentials
type: Opaque
data:
  username: YWRtaW4=  # base64 encoded
  password: cGFzc3dvcmQ=  # base64 encoded
```

### 4. RBAC
- Principle of least privilege
- Regular audit of permissions
- Service account per application

## Troubleshooting Production Issues

### Common Production Issues

#### Pod Crashes
```bash
# Check pod status
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name> --previous

# Check resource constraints
kubectl top pods
```

#### Database Connection Issues
```bash
# Test MongoDB connectivity
kubectl exec -it <api-pod> -- curl -v http://mongodb-service:27017

# Check MongoDB logs
kubectl logs -l app=mongodb

# Verify secrets
kubectl get secret mongodb-credentials -o yaml
```

#### Performance Issues
```bash
# Check HPA scaling
kubectl describe hpa dinosaur-api-hpa

# Monitor resource usage
kubectl top pods -l app=dinosaur-api
kubectl top nodes

# Check application metrics
curl http://localhost:8080/api/cluster-status
```

### Emergency Procedures

#### Scale Down (Maintenance)
```bash
kubectl scale deployment dinosaur-api --replicas=0
```

#### Emergency Rollback
```bash
kubectl rollout undo deployment/dinosaur-api
kubectl rollout status deployment/dinosaur-api
```

#### Database Recovery
```bash
# Restore from backup
kubectl exec -it mongodb-0 -- mongorestore --uri="mongodb://admin:password@localhost:27017/dinosaurdb?authSource=admin" /tmp/backup/dinosaurdb
```

## Next Steps

1. **Set up monitoring** with Prometheus/Grafana
2. **Configure alerting** for critical issues
3. **Implement CI/CD** pipeline
4. **Set up backup automation**
5. **Add network policies** for security
6. **Configure TLS certificates** for HTTPS
7. **Set up log aggregation** with ELK/Fluentd

For detailed troubleshooting commands, see [K8s Cheatsheet](docs/k8s_cheatsheet.md).
