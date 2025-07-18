#!/bin/bash

# Docker Compose Management Script for Chat App
echo "🐳 Chat App Docker Compose Manager"
echo "=================================="

case "${1:-help}" in
    "up"|"start")
        echo "🚀 Starting all services with Docker Compose..."
        docker-compose up -d
        echo ""
        echo "✅ Services started!"
        echo "📋 Service URLs:"
        echo "   Backend:  http://localhost:5000"
        echo "   Frontend: http://localhost:3000"
        echo "   MongoDB:  mongodb://localhost:27017"
        echo ""
        echo "📊 View logs: ./docker-compose.sh logs"
        echo "🛑 Stop all:  ./docker-compose.sh stop"
        ;;
    
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        echo "✅ All services stopped!"
        ;;
    
    "restart")
        echo "🔄 Restarting all services..."
        docker-compose down
        docker-compose up -d
        echo "✅ All services restarted!"
        ;;
    
    "logs")
        echo "📋 Showing logs for all services..."
        echo "Press Ctrl+C to exit"
        docker-compose logs -f
        ;;
    
    "status")
        echo "📊 Service Status:"
        docker-compose ps
        ;;
    
    "build")
        echo "🔨 Building all services..."
        docker-compose build --no-cache
        echo "✅ Build complete!"
        ;;
    
    "clean")
        echo "🧹 Cleaning up containers and images..."
        docker-compose down -v --rmi all
        echo "✅ Cleanup complete!"
        ;;
    
    "backend-only")
        echo "🚀 Starting backend and database only..."
        docker-compose up -d mongodb backend
        echo "✅ Backend services started!"
        ;;
    
    "help"|*)
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  up/start      - Start all services"
        echo "  stop          - Stop all services"
        echo "  restart       - Restart all services"
        echo "  logs          - View logs for all services"
        echo "  status        - Show status of all services"
        echo "  build         - Rebuild all services"
        echo "  clean         - Stop and remove all containers/images"
        echo "  backend-only  - Start only backend and database"
        echo "  help          - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 up          # Start all services"
        echo "  $0 backend-only # Start only backend services"
        echo "  $0 logs        # View logs"
        echo "  $0 stop        # Stop everything"
        ;;
esac
