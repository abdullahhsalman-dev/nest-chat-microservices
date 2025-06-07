#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display status messages
function log() {
  echo -e "${BLUE}[$(date +"%T")]${NC} $1"
}

# Function to display success messages
function success() {
  echo -e "${GREEN}[$(date +"%T")]${NC} $1"
}

# Function to display warning messages
function warning() {
  echo -e "${YELLOW}[$(date +"%T")]${NC} $1"
}

# Function to display error messages
function error() {
  echo -e "${RED}[$(date +"%T")]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  error "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build and start the containers
log "Building and starting the microservices..."
docker-compose down
docker-compose build
docker-compose up -d

# Wait for containers to start
log "Waiting for containers to start..."
sleep 10

# Check if all services are running
log "Checking services status..."
services=("api-gateway" "auth-service" "chat-service" "presence-service" "notification-service" "mongodb" "redis")

for service in "${services[@]}"; do
  if docker-compose ps | grep -q "$service" | grep -q "Up"; then
    success "✅ $service is running"
  else
    warning "⚠️ $service may not be running properly"
  fi
done

# Show the API Gateway URL
success "\n🚀 All services started! API Gateway is available at: http://localhost:3000"
success "📝 Swagger API documentation is available at: http://localhost:3000/api"

# Show logs in real-time
echo ""
log "Showing logs (press Ctrl+C to exit)..."
docker-compose logs -f