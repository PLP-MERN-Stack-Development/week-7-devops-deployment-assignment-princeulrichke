import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import { connectDatabase } from './utils/database';
import { logger } from './utils/logger';
import { handleSocketConnection } from './socket/socketHandlers';

// Import routes
import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import messageRoutes from './routes/messages';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Rate limiting - more lenient in development
const isDevelopment = process.env.NODE_ENV === 'development';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: isDevelopment ? 1000 : 100, // 1000 requests in dev, 100 in production
  duration: 60, // Per 60 seconds
});

const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: isDevelopment ? 50 : 5, // 50 requests in dev, 5 in production
  duration: 60, // Per 60 seconds
});

// Global middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth rate limiting - only applied to auth routes
app.use('/api/auth', async (req, res, next) => {
  try {
    const key = req.ip || 'unknown';
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many authentication attempts' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.IO connection handling
handleSocketConnection(io);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
