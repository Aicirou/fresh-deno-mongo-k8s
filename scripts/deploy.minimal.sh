#!/bin/bash

# Minimal deployment script for Dinosaur API

echo "🦕 Building Docker image..."
docker build -f Dockerfile.minimal -t dinosaur-api:minimal .

echo "📦 Loading image into minikube..."
minikube image load dinosaur-api:minimal

echo "🚀 Applying Kubernetes manifests..."
kubectl apply -f k8s/deployment.minimal.yaml
kubectl apply -f k8s/service.minimal.yaml
kubectl apply -f k8s/ingress.minimal.yaml

echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/dinosaur-api

echo "✅ Deployment complete!"
echo ""
echo "Access the API:"
echo "  Local: kubectl port-forward service/dinosaur-api-service 8080:80"
echo "  Then visit: http://localhost:8080"
echo ""
echo "Check status:"
echo "  kubectl get pods -l app=dinosaur-api"
echo "  kubectl logs -l app=dinosaur-api"
