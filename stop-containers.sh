#!/bin/bash

# Stop all MERN Chat containers
set -e

echo "🛑 Stopping MERN Chat Containers..."

# Stop backend container
if [ "$(docker ps -q -f name=mern-chat-backend)" ]; then
    echo "⏹️  Stopping backend container..."
    docker stop mern-chat-backend
    docker rm mern-chat-backend
    echo "✅ Backend container stopped"
else
    echo "ℹ️  Backend container not running"
fi

# Stop frontend container
if [ "$(docker ps -q -f name=mern-chat-frontend)" ]; then
    echo "⏹️  Stopping frontend container..."
    docker stop mern-chat-frontend
    docker rm mern-chat-frontend
    echo "✅ Frontend container stopped"
else
    echo "ℹ️  Frontend container not running"
fi

echo ""
echo "🏁 All MERN Chat containers stopped!"

# Show remaining containers
echo ""
echo "📊 Remaining containers:"
docker ps | head -1
docker ps | grep mern-chat || echo "No MERN Chat containers running"
