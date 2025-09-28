#!/bin/bash
# Development helper script for the Dinosaur API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main function
case "${1:-help}" in
    "dev")
        print_status "Starting Fresh development server..."
        if command_exists deno; then
            deno task dev
        else
            print_error "Deno not found! Please install Deno first."
            exit 1
        fi
        ;;
    
    "build")
        print_status "Building Docker image..."
        docker build -t fresh-dinosaur-api:latest .
        print_success "Image built successfully"
        ;;
    
    "test")
        print_status "Running tests..."
        if command_exists deno; then
            deno test
        else
            print_error "Deno not found! Please install Deno first."
            exit 1
        fi
        ;;
    
    "deploy")
        print_status "Deploying Fresh app to Kubernetes..."
        ./scripts/deploy-full-stack.sh
        ;;
    
    "deploy-full")
        print_status "Full stack deployment..."
        ./scripts/deploy-full-stack.sh
        ;;
    
    "deploy-full")
        print_status "Deploying full stack with MongoDB..."
        ./scripts/deploy-full-stack.sh
        ;;
    
    "clean")
        print_status "Cleaning up Kubernetes resources..."
        kubectl delete -f k8s/ || print_warning "Some resources may not exist"
        print_success "Cleanup completed"
        ;;
    
    "status")
        print_status "Checking Kubernetes deployment status..."
        echo ""
        echo "📦 API Pods:"
        kubectl get pods -l app=dinosaur-api 2>/dev/null || print_warning "No API pods found"
        echo ""
        echo "🗄️  Database Pods:"
        kubectl get pods -l app=mongodb 2>/dev/null || print_warning "No MongoDB pods found"
        echo ""
        echo "🔗 Services:"
        kubectl get svc -l app=dinosaur-api 2>/dev/null || print_warning "No API services found"
        kubectl get svc -l app=mongodb 2>/dev/null || print_warning "No MongoDB services found"
        echo ""
        echo "📊 HPA:"
        kubectl get hpa dinosaur-api-hpa 2>/dev/null || print_warning "HPA not found"
        echo ""
        echo "📈 Resource Usage:"
        kubectl top pods -l app=dinosaur-api 2>/dev/null || print_warning "Metrics not available (metrics-server may not be installed)"
        ;;
    
    "logs")
        print_status "Fetching application logs..."
        kubectl logs -l app=dinosaur-api -f
        ;;
    
    "port-forward")
        PORT=${2:-8080}
        print_status "Port forwarding to localhost:$PORT..."
        print_success "🦕 Access the UI at http://localhost:$PORT/ui"
        print_success "📊 Access the API at http://localhost:$PORT/api"
        kubectl port-forward service/dinosaur-api-service $PORT:80
        ;;
    
    "ui")
        print_status "Opening Dinosaur Explorer UI..."
        PORT=${2:-8080}
        if command -v open >/dev/null 2>&1; then
            open "http://localhost:$PORT/ui"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "http://localhost:$PORT/ui"
        else
            print_success "🦕 Dinosaur Explorer UI: http://localhost:$PORT/ui"
        fi
        ;;
    
    "restart")
        print_status "Restarting deployment..."
        kubectl rollout restart deployment/dinosaur-api
        kubectl rollout status deployment/dinosaur-api
        print_success "Deployment restarted"
        ;;
    
    "help"|*)
        echo "🦕 Dinosaur API Development Helper"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  dev          Start local development server"
        echo "  build        Build Docker image"
        echo "  test         Run tests"
        echo "  deploy       Deploy API only to Kubernetes"
        echo "  deploy-full  Deploy full stack (API + MongoDB)"
        echo "  clean        Clean up Kubernetes resources"
        echo "  status       Show deployment status (API + MongoDB)"
        echo "  logs         Follow application logs"
        echo "  port-forward Forward service to localhost (default port: 8080)"
        echo "  ui           Open Dinosaur Explorer UI in browser"
        echo "  restart      Restart the deployment"
        echo "  help         Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 dev                    # Start local development"
        echo "  $0 deploy-full            # Deploy full stack (recommended)"
        echo "  $0 port-forward 8080      # Forward to localhost:8080"
        echo "  $0 ui                     # Open Dinosaur Explorer UI"
        echo "  $0 status                 # Check deployment status"
        ;;
esac
