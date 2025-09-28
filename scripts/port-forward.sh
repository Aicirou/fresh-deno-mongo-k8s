#!/bin/bash

# Dinosaur API Port Forward Script
# This script automatically sets up port forwarding to access the dinosaur API locally

set -e

echo "🦕 Dinosaur API Port Forward Setup"
echo "=================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if minikube is running
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Kubernetes cluster is not accessible"
    echo "💡 Make sure minikube is running: minikube start"
    exit 1
fi

# Get the first available dinosaur-api pod
POD_NAME=$(kubectl get pods -l app=dinosaur-api -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$POD_NAME" ]; then
    echo "❌ No dinosaur-api pods found"
    echo "💡 Make sure the dinosaur-api deployment is running"
    exit 1
fi

echo "📦 Found pod: $POD_NAME"

# Kill any existing port forwards
echo "🔧 Cleaning up existing port forwards..."
pkill -f "kubectl port-forward.*8000" 2>/dev/null || true
sleep 2

# Set up port forwarding
echo "🚀 Setting up port forward: localhost:8000 -> pod:8000"
kubectl port-forward "$POD_NAME" 8000:8000 &
PORT_FORWARD_PID=$!

# Wait a moment for port forward to establish
sleep 3

# Test the connection
echo "🧪 Testing connection..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Port forward successful!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Health:         http://localhost:8000/health"
    echo "   API:            http://localhost:8000/api"
    echo "   Dinosaurs:      http://localhost:8000/api/dinosaurs"
    echo "   Cluster Status: http://localhost:8000/api/cluster-status"
    echo "   Web UI:         http://localhost:8000/ui"
    echo ""
    echo "📊 NodePort Access (alternative):"
    MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
    echo "   Base URL:       http://$MINIKUBE_IP:30080"
    echo "   Cluster Status: http://$MINIKUBE_IP:30080/api/cluster-status"
    echo ""
    echo "🔧 Port forward PID: $PORT_FORWARD_PID"
    echo "💡 To stop: kill $PORT_FORWARD_PID or pkill -f 'kubectl port-forward.*8000'"
    echo ""
    echo "🦕 Dinosaur API is ready! Press Ctrl+C to stop port forwarding."
    
    # Keep the script running to maintain port forward
    wait $PORT_FORWARD_PID
else
    echo "❌ Connection test failed"
    kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi
