#!/bin/bash

# Chat App Backend Docker Runner
# This script helps you run the backend as a Docker container

echo "🚀 Starting Chat App Backend Docker Container..."

# Check if container is already running
if [ "$(docker ps -q -f name=chat-app-backend)" ]; then
    echo "⚠️  Container 'chat-app-backend' is already running!"
    echo "Use './stop-docker.sh' to stop it first."
    exit 1
fi

# Remove existing container if it exists (but is stopped)
if [ "$(docker ps -aq -f name=chat-app-backend)" ]; then
    echo "🗑️  Removing existing stopped container..."
    docker rm chat-app-backend
fi

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating default .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Created .env file with default values"
    echo "🔧 Please update the .env file with your actual values"
fi

# Run the Docker container
echo "🐳 Starting Docker container..."
docker run -d \
  --name chat-app-backend \
  --env-file .env \
  -p 5000:5000 \
  --restart unless-stopped \
  chat-app-backend:latest

if [ $? -eq 0 ]; then
    echo "✅ Backend container started successfully!"
    echo ""
    echo "📋 Container Info:"
    echo "   Name: chat-app-backend"
    echo "   Port: http://localhost:5000"
    echo "   Status: $(docker ps --format 'table {{.Status}}' -f name=chat-app-backend | tail -n +2)"
    echo ""
    echo "📊 To view logs: docker logs chat-app-backend"
    echo "🛑 To stop: ./stop-docker.sh"
    echo "🔄 To restart: ./restart-docker.sh"
else
    echo "❌ Failed to start container!"
    exit 1
fi
