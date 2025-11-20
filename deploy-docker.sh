#!/bin/bash

# WoW Class Helper - Docker Deployment Script
# This script builds and runs the application in Docker

set -e

echo "🚀 WoW Class Helper - Docker Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Building Docker image...${NC}"
docker build -t wow-class-helper:latest .

echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

echo -e "${BLUE}Step 2: Stopping existing container (if any)...${NC}"
docker stop wow-class-helper 2>/dev/null || true
docker rm wow-class-helper 2>/dev/null || true

echo -e "${GREEN}✓ Old container removed${NC}"
echo ""

echo -e "${BLUE}Step 3: Running new container...${NC}"
docker run -d \
  --name wow-class-helper \
  -p 3000:80 \
  --restart unless-stopped \
  wow-class-helper:latest

echo -e "${GREEN}✓ Container started successfully${NC}"
echo ""

echo -e "${BLUE}Step 4: Verifying container...${NC}"
sleep 2

if docker ps | grep -q wow-class-helper; then
    echo -e "${GREEN}✓ Container is running${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo "Application is available at: http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     docker logs -f wow-class-helper"
    echo "  Stop:          docker stop wow-class-helper"
    echo "  Start:         docker start wow-class-helper"
    echo "  Remove:        docker rm wow-class-helper"
else
    echo -e "${YELLOW}⚠ Container failed to start${NC}"
    echo "Check logs with: docker logs wow-class-helper"
    exit 1
fi
