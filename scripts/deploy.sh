#!/bin/bash
# Build and deploy the Dinosaur API to Kubernetes

set -e  # Exit on any error

echo "🏗️  Building Docker image..."
cd tutorial-with-express
docker build -t dinosaur-api:latest .

echo "📦 Loading image into minikube (if using minikube)..."
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    minikube image load dinosaur-api:latest
    echo "✅ Image loaded into minikube"
else
    echo "ℹ️  Minikube not detected or not running, skipping image load"
fi

echo "🚀 Deploying to Kubernetes..."
cd ../
kubectl apply -f k8s/

echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/dinosaur-api --timeout=300s

echo "📊 Deployment status:"
kubectl get pods -l app=dinosaur-api
kubectl get svc dinosaur-api-service
kubectl get hpa dinosaur-api-hpa

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "To test the API:"
echo "  kubectl port-forward service/dinosaur-api-service 8080:80"
echo "  curl http://localhost:8080/api/triceratops"
echo ""
echo "To view logs:"
echo "  kubectl logs -l app=dinosaur-api -f"
