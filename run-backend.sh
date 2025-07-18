#!/bin/bash

# Run Backend Docker Container
set -e

echo "🚀 Starting Backend Docker Container..."

# Check if container is already running
if [ "$(docker ps -q -f name=mern-chat-backend)" ]; then
    echo "⚠️  Backend container is already running. Stopping it first..."
    docker stop mern-chat-backend
    docker rm mern-chat-backend
fi

# Run the backend container
docker run -d \
  --name mern-chat-backend \
  --network host \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://localhost:27017/mern-chat \
  -e JWT_SECRET=your-super-secret-jwt-key-change-in-production \
  -p 5000:5000 \
  mern-chat-backend:latest

echo "✅ Backend container started successfully!"
echo "🌐 Backend running on: http://localhost:5000"
echo "📋 Container name: mern-chat-backend"

# Show container status
echo ""
echo "📊 Container Status:"
docker ps | grep mern-chat-backend

# Show logs
echo ""
echo "📝 Container Logs (last 10 lines):"
sleep 2
docker logs --tail 10 mern-chat-backend
