#!/bin/bash

# Build Frontend Docker Image Script
set -e

echo "🏗️  Building Frontend Docker Image..."

# Navigate to frontend directory
cd frontend

# Build the Docker image
docker build -t mern-chat-frontend:latest .

echo "✅ Frontend Docker image built successfully!"
echo "📦 Image: mern-chat-frontend:latest"

# Show image info
echo "📊 Image Details:"
docker images mern-chat-frontend:latest
