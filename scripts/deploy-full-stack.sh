#!/bin/bash
# Enhanced deployment script with MongoDB support

set -e  # Exit on any error

echo "🏗️  Building Docker image..."
docker build -t fresh-dinosaur-api:latest .

echo "📦 Loading image into minikube (if using minikube)..."
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    minikube image load fresh-dinosaur-api:latest
    echo "✅ Image loaded into minikube"
else
    echo "ℹ️  Minikube not detected or not running, skipping image load"
fi

echo "🍃 Deploying MongoDB..."
kubectl apply -f k8s/mongodb.yaml

echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

echo "� Deploying Dinosaur API (with auto-seeding)..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

echo "⏳ Waiting for API deployment to be ready..."
kubectl rollout status deployment/dinosaur-api --timeout=300s

echo "📊 Deployment status:"
kubectl get pods -l app=dinosaur-api
kubectl get pods -l app=mongodb
kubectl get svc dinosaur-api-service
kubectl get svc mongodb-service

echo ""
echo "🎉 Fresh Dinosaur API deployed successfully!"
echo ""
echo "🚀 Quick Access (port-forward automatically enabled):"
echo "  kubectl port-forward service/dinosaur-api-service 8080:80 &"
echo "  echo 'Opening Fresh UI at http://localhost:8080'"
echo ""
echo "� Application endpoints:"
echo "  http://localhost:8080/           # Fresh UI (main interface)"
echo "  http://localhost:8080/api        # All dinosaurs"
echo "  http://localhost:8080/api/cluster-status  # Live cluster monitoring"
echo "  http://localhost:8080/health     # Health check"
echo ""
echo "📊 Monitoring:"
echo "  kubectl logs -l app=dinosaur-api -f"
echo "  kubectl logs -l app=mongodb -f"
