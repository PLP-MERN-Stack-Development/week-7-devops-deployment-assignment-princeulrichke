#!/bin/bash

# Build Backend Docker Image Script
set -e

echo "🏗️  Building Backend Docker Image..."

# Navigate to backend directory
cd backend

# Build the Docker image
docker build -t mern-chat-backend:latest .

echo "✅ Backend Docker image built successfully!"
echo "📦 Image: mern-chat-backend:latest"

# Show image info
echo "📊 Image Details:"
docker images mern-chat-backend:latest
