#!/bin/bash

# Chat App Backend Docker Logs Viewer
echo "📋 Chat App Backend Docker Logs"
echo "================================="

if [ "$(docker ps -q -f name=chat-app-backend)" ]; then
    echo "📊 Showing logs for running container..."
    echo "Press Ctrl+C to exit"
    echo ""
    docker logs -f chat-app-backend
else
    echo "⚠️  Container 'chat-app-backend' is not running."
    echo "🚀 Start it with: ./run-docker.sh"
    
    # Show logs from stopped container if it exists
    if [ "$(docker ps -aq -f name=chat-app-backend)" ]; then
        echo ""
        echo "📜 Last logs from stopped container:"
        docker logs chat-app-backend
    fi
fi
