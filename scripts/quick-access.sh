#!/bin/bash
# Quick access script for Dinosaur API

echo "🦕 Dinosaur API Quick Access"
echo "=========================="

# Check if port forwarding is running
if pgrep -f "kubectl port-forward.*8000" > /dev/null; then
    echo "✅ Port forwarding is active on localhost:8000"
else
    echo "🔧 Starting port forwarding..."
    POD_NAME=$(kubectl get pods -l app=dinosaur-api -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    if [ -n "$POD_NAME" ]; then
        kubectl port-forward "$POD_NAME" 8000:8000 &
        sleep 3
        echo "✅ Port forwarding started"
    else
        echo "❌ No dinosaur-api pods found"
        exit 1
    fi
fi

echo ""
echo "🌐 Available endpoints:"
echo "   http://localhost:8000/health"
echo "   http://localhost:8000/api/cluster-status"
echo "   http://localhost:8000/api"
echo "   http://localhost:8000/ui"
echo ""
echo "📊 Alternative NodePort access:"
MINIKUBE_IP=$(minikube ip 2>/dev/null)
echo "   http://$MINIKUBE_IP:30080/api/cluster-status"
echo ""

# Quick test
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is responding!"
    echo ""
    echo "🧪 Quick cluster status test:"
    curl -s http://localhost:8000/api/cluster-status | jq -r '.clusterInfo.connected // "N/A"' 2>/dev/null && echo " - Cluster connected" || echo " - Check connection"
else
    echo "❌ API not responding, check port forwarding"
fi
