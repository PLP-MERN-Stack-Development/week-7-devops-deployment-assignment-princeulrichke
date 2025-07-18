# Deployment Guide

This document provides comprehensive instructions for deploying the MERN Stack Chat Application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (for local development without Docker)
- Git

## Environment Setup

### 1. Environment Variables

Create the following environment files:

#### Backend (.env in backend/ folder)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongo:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend (.env.local in frontend/ folder)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 2. Production Environment Variables

For production deployment, update the URLs:

#### Frontend (.env.production in frontend/ folder)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

#### Backend (.env.production in backend/ folder)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your-production-jwt-secret-256-bit-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

1. **Build and start all services:**
```bash
docker compose up --build -d
```

2. **View logs:**
```bash
docker compose logs -f
```

3. **Stop services:**
```bash
docker compose down
```

4. **Stop and remove volumes:**
```bash
docker compose down -v
```

### Method 2: Separate Docker Containers

1. **Create a Docker network:**
```bash
docker network create chatapp-network
```

2. **Run MongoDB:**
```bash
docker run -d \
  --name mongo \
  --network chatapp-network \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:7
```

3. **Build and run backend:**
```bash
cd backend
docker build -t chatapp-backend .
docker run -d \
  --name chatapp-backend \
  --network chatapp-network \
  -p 5000:5000 \
  --env-file .env.production \
  chatapp-backend
```

4. **Build and run frontend:**
```bash
cd frontend
docker build -t chatapp-frontend .
docker run -d \
  --name chatapp-frontend \
  -p 3000:3000 \
  --env-file .env.production \
  chatapp-frontend
```

### Method 3: Manual Deployment

1. **Install dependencies and build backend:**
```bash
cd backend
npm install
npm run build
npm start
```

2. **Install dependencies and build frontend:**
```bash
cd frontend
npm install
npm run build
npm start
```

## Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 instance** (Ubuntu 22.04 LTS recommended)

2. **Install Docker:**
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

3. **Clone repository:**
```bash
git clone <your-repo-url>
cd <repo-name>
```

4. **Set up environment variables** (see Environment Setup section)

5. **Deploy:**
```bash
docker compose up --build -d
```

6. **Configure security groups** to allow traffic on ports 80, 443, 3000, and 5000

### Digital Ocean Droplet

Similar to AWS EC2, but use Digital Ocean's one-click Docker application for easier setup.

### Heroku Deployment

1. **Install Heroku CLI**

2. **Backend deployment:**
```bash
cd backend
heroku create your-backend-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

3. **Frontend deployment:**
```bash
cd frontend
heroku create your-frontend-app-name
heroku config:set NEXT_PUBLIC_API_URL=https://your-backend-app-name.herokuapp.com
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Vercel + Railway/PlanetScale

1. **Deploy backend to Railway:**
   - Connect GitHub repository
   - Set environment variables
   - Deploy backend service

2. **Deploy frontend to Vercel:**
   - Connect GitHub repository
   - Set environment variables
   - Deploy frontend

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

1. **Install certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Create nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Obtain SSL certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

## Health Checks

The application includes health check endpoints:

- Backend: `GET /api/health`
- Database connectivity is checked automatically

## Monitoring

### Logs

- Backend logs: `docker compose logs backend`
- Frontend logs: `docker compose logs frontend`
- Database logs: `docker compose logs mongo`

### Performance Monitoring

Consider integrating:
- Sentry for error tracking
- New Relic for performance monitoring
- MongoDB Atlas monitoring for database performance

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec mongo mongodump --out /backup

# Restore backup
docker exec mongo mongorestore /backup
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v chatapp_mongo-data:/backup-source -v $(pwd):/backup ubuntu tar czf /backup/mongo-backup.tar.gz -C /backup-source .

# Restore volumes
docker run --rm -v chatapp_mongo-data:/restore-target -v $(pwd):/backup ubuntu tar xzf /backup/mongo-backup.tar.gz -C /restore-target
```

## Scaling

### Horizontal Scaling

1. **Use a load balancer** (nginx, HAProxy, or cloud load balancer)
2. **Run multiple backend instances**
3. **Use Redis for session storage** (Socket.io scaling)
4. **Use MongoDB Atlas or cluster for database scaling**

### Vertical Scaling

- Increase CPU and memory resources
- Optimize MongoDB indexes
- Implement caching strategies

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   sudo lsof -i :5000
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   docker compose logs mongo
   
   # Test connection
   docker exec -it mongo mongosh
   ```

3. **Environment variable issues:**
   ```bash
   # Check if variables are loaded
   docker compose exec backend env | grep NODE_ENV
   ```

4. **Build issues:**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker compose build --no-cache
   ```

### Performance Issues

1. **Enable compression:**
   - Add gzip compression to nginx
   - Enable compression in Express.js

2. **Optimize database queries:**
   - Add proper indexes
   - Use aggregation pipelines

3. **Implement caching:**
   - Redis for API responses
   - CDN for static assets

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Configure proper MongoDB security
- [ ] Use security headers (Helmet.js is included)
- [ ] Implement proper input validation
- [ ] Set up monitoring and alerts

## Support

For issues and questions:
1. Check the logs first
2. Verify environment configuration
3. Test individual components
4. Check network connectivity
5. Review this deployment guide
