#!/bin/bash

# MongoDB Port Forward Script
# This script automatically sets up port forwarding to access MongoDB locally

set -e

echo "📦 MongoDB Port Forward Setup"
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

# Get the mongodb pod
POD_NAME=$(kubectl get pods -l app=mongodb -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$POD_NAME" ]; then
    echo "❌ No mongodb pods found"
    echo "💡 Make sure the mongodb statefulset is running"
    exit 1
fi

echo "📦 Found pod: $POD_NAME"

# Kill any existing port forwards
echo "🔧 Cleaning up existing port forwards..."
pkill -f "kubectl port-forward.*27017" 2>/dev/null || true
sleep 2

# Set up port forwarding
echo "🚀 Setting up port forward: localhost:27017 -> pod:27017"
kubectl port-forward "$POD_NAME" 27017:27017 &
PORT_FORWARD_PID=$!

# Wait a moment for port forward to establish
sleep 3

# Test the connection
echo "🧪 Testing connection..."
if command -v mongosh &> /dev/null && mongosh --eval "db.adminCommand('ping')" --host localhost > /dev/null 2>&1; then
    echo "✅ Port forward successful! (using mongosh)"
    echo ""
    echo "🔧 Port forward PID: $PORT_FORWARD_PID"
    echo "💡 To stop: kill $PORT_FORWARD_PID or pkill -f 'kubectl port-forward.*27017'"
    echo ""
    echo "📦 MongoDB is ready! Press Ctrl+C to stop port forwarding."
    
    # Keep the script running to maintain port forward
    wait $PORT_FORWARD_PID
elif command -v nc &> /dev/null && nc -z localhost 27017; then
    echo "✅ Port forward appears successful! (using nc)"
    echo "⚠️  Could not verify with mongosh, but port is open."
    echo ""
    echo "🔧 Port forward PID: $PORT_FORWARD_PID"
    echo "💡 To stop: kill $PORT_FORWARD_PID or pkill -f 'kubectl port-forward.*27017'"
    echo ""
    echo "📦 MongoDB is ready! Press Ctrl+C to stop port forwarding."
    
    # Keep the script running to maintain port forward
    wait $PORT_FORWARD_PID
else
    echo "❌ Connection test failed"
    kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi
