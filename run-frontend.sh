#!/bin/bash

# Run Frontend Docker Container
set -e

echo "🚀 Starting Frontend Docker Container..."

# Check if container is already running
if [ "$(docker ps -q -f name=mern-chat-frontend)" ]; then
    echo "⚠️  Frontend container is already running. Stopping it first..."
    docker stop mern-chat-frontend
    docker rm mern-chat-frontend
fi

# Run the frontend container
docker run -d \
  --name mern-chat-frontend \
  --network host \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  -e NEXT_PUBLIC_SOCKET_URL=http://localhost:5000 \
  -p 3000:3000 \
  mern-chat-frontend:latest

echo "✅ Frontend container started successfully!"
echo "🌐 Frontend running on: http://localhost:3000"
echo "📋 Container name: mern-chat-frontend"

# Show container status
echo ""
echo "📊 Container Status:"
docker ps | grep mern-chat-frontend

# Show logs
echo ""
echo "📝 Container Logs (last 10 lines):"
sleep 2
docker logs --tail 10 mern-chat-frontend
