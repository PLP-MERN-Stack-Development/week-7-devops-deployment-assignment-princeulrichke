#!/bin/bash

# Chat App Backend Docker Restart
echo "🔄 Restarting Chat App Backend Docker Container..."

# Stop the container if running
if [ "$(docker ps -q -f name=chat-app-backend)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop chat-app-backend
fi

# Wait a moment
sleep 2

# Start the container
echo "🚀 Starting container..."
./run-docker.sh
