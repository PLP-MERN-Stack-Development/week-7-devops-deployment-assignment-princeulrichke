#!/bin/bash

# Build All Docker Images Script
set -e

echo "🚀 Building All MERN Chat Docker Images..."

# Build backend
echo "1️⃣  Building Backend..."
./build-backend.sh

echo ""

# Build frontend
echo "2️⃣  Building Frontend..."
./build-frontend.sh

echo ""
echo "🎉 All images built successfully!"
echo ""
echo "📦 Available Images:"
docker images | grep "mern-chat"

echo ""
echo "🐳 Ready to run with Docker Compose!"
echo "   docker-compose up -d"
