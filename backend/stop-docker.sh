#!/bin/bash

# Chat App Backend Docker Stopper
echo "🛑 Stopping Chat App Backend Docker Container..."

if [ "$(docker ps -q -f name=chat-app-backend)" ]; then
    docker stop chat-app-backend
    echo "✅ Container stopped successfully!"
else
    echo "⚠️  Container 'chat-app-backend' is not running."
fi
