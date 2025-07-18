# 🐳 MERN Chat Application - Docker Guide

This guide provides comprehensive instructions for building, running, and managing the MERN Chat application using Docker containers.

## 📋 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **4GB RAM**: Minimum recommended for running all services

## 🏗️ Project Structure

```
├── backend/
│   ├── Dockerfile                 # Backend Docker configuration
│   ├── package.json              # Backend dependencies
│   └── src/                      # Backend source code
├── frontend/
│   ├── Dockerfile                # Frontend Docker configuration
│   ├── package.json              # Frontend dependencies
│   └── src/                      # Frontend source code
├── docker-compose.yml            # Full stack with build
├── docker-compose.images.yml     # Full stack with pre-built images
├── build-all.sh                  # Build all Docker images
├── build-backend.sh              # Build backend image only
├── build-frontend.sh             # Build frontend image only
├── run-backend.sh                # Run backend container standalone
├── run-frontend.sh               # Run frontend container standalone
└── stop-containers.sh            # Stop all containers
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/mern-chat-project
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Using Pre-built Images

1. **Build all images:**
   ```bash
   ./build-all.sh
   ```

2. **Run with pre-built images:**
   ```bash
   docker-compose -f docker-compose.images.yml up -d
   ```

## 🔧 Individual Components

### Backend Only

```bash
# Build backend image
./build-backend.sh

# Run backend container
./run-backend.sh

# Backend will be available at http://localhost:5000
```

### Frontend Only

```bash
# Build frontend image
./build-frontend.sh

# Run frontend container (requires backend to be running)
./run-frontend.sh

# Frontend will be available at http://localhost:3000
```

## 📦 Docker Images

### Backend Image Details
- **Base Image**: `node:18-alpine`
- **Size**: ~150MB (optimized multi-stage build)
- **Port**: 5000
- **Health Check**: Included
- **User**: Non-root (nodejs:1001)

### Frontend Image Details
- **Base Image**: `node:18-alpine`
- **Size**: ~100MB (Next.js standalone build)
- **Port**: 3000
- **Output**: Standalone optimized build
- **User**: Non-root (nextjs:1001)

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `./build-all.sh` | Build both frontend and backend images |
| `./build-backend.sh` | Build only backend image |
| `./build-frontend.sh` | Build only frontend image |
| `./run-backend.sh` | Run backend container standalone |
| `./run-frontend.sh` | Run frontend container standalone |
| `./stop-containers.sh` | Stop all running containers |

## 🌐 Environment Variables

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password@mongodb:27017/chatapp?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📊 Service Overview

| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| Frontend | 3000 | Next.js React app | Backend |
| Backend | 5000 | Express.js API + Socket.io | MongoDB |
| MongoDB | 27017 | Database | None |
| Redis | 6379 | Session store (optional) | None |
| Nginx | 80/443 | Reverse proxy (optional) | Frontend, Backend |

## 🔍 Monitoring & Debugging

### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Individual containers
docker logs -f mern-chat-backend
docker logs -f mern-chat-frontend
```

### Check Container Status
```bash
# All containers
docker ps

# MERN Chat containers only
docker ps | grep mern-chat

# Container health
docker inspect mern-chat-backend | grep Health -A 10
```

### Enter Container Shell
```bash
# Backend container
docker exec -it mern-chat-backend sh

# Frontend container
docker exec -it mern-chat-frontend sh

# MongoDB container
docker exec -it mongodb mongo
```

## 🔧 Development vs Production

### Development Mode
```bash
# Use docker-compose.yml for development with live builds
docker-compose up -d
```

### Production Mode
```bash
# Build optimized images first
./build-all.sh

# Use pre-built images for production
docker-compose -f docker-compose.images.yml up -d
```

## 🛡️ Security Features

- **Non-root users** in all containers
- **Multi-stage builds** to minimize attack surface
- **Health checks** for service monitoring
- **Environment variable** configuration
- **Network isolation** with custom Docker network

## 📈 Performance Optimization

### Image Optimization
- Multi-stage builds reduce image size by 60-70%
- Alpine Linux base images for minimal footprint
- .dockerignore files exclude unnecessary files
- Layer caching optimized build order

### Runtime Optimization
- Next.js standalone output for minimal runtime
- Node.js production mode optimizations
- Health checks for automatic recovery
- Resource limits can be configured in docker-compose

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5000
   ```

2. **Image build failures:**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -a
   ./build-all.sh
   ```

3. **Container startup issues:**
   ```bash
   # Check logs for errors
   docker-compose logs backend
   docker-compose logs frontend
   ```

4. **Database connection issues:**
   ```bash
   # Verify MongoDB is running
   docker-compose ps mongodb
   docker-compose logs mongodb
   ```

### Reset Everything
```bash
# Stop all containers
./stop-containers.sh

# Remove all containers and images
docker-compose down -v --rmi all

# Rebuild everything
./build-all.sh
docker-compose up -d
```

## 📚 Advanced Usage

### Custom Network Configuration
```bash
# Create custom network
docker network create chat-network-custom

# Run containers with custom network
docker run --network chat-network-custom mern-chat-backend
```

### Volume Management
```bash
# Backup MongoDB data
docker run --rm -v mern-chat_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /data .

# Restore MongoDB data
docker run --rm -v mern-chat_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /data
```

### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🎯 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mern-chat

# Scale services
docker service scale mern-chat_backend=3
```

### Using Kubernetes
```bash
# Convert docker-compose to k8s
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f .
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify all environment variables are set correctly
3. Ensure Docker has sufficient resources allocated
4. Check network connectivity between containers

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API responding at http://localhost:5000
- ✅ Real-time chat functionality working
- ✅ Database persistence across container restarts

Happy chatting! 🎊
