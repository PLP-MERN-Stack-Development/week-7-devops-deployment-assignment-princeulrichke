# MERN Stack Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) featuring group messaging, user authentication, and responsive design.

![Chat Application](https://img.shields.io/badge/MERN-Stack-green) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-orange) ![Docker](https://img.shields.io/badge/Docker-Containerized-blue)

## 🚀 Features

### Core Features
- **Real-time messaging** with Socket.io
- **Group creation and management**
- **User authentication** (JWT-based)
- **Responsive design** (mobile-friendly)
- **Typing indicators**
- **Message editing and deletion**
- **User presence status**
- **Clean, modern UI** with Tailwind CSS

### Technical Features
- **TypeScript** for type safety
- **Production-ready** deployment configuration
- **Docker containerization**
- **CI/CD pipeline** with GitHub Actions
- **Health checks** and monitoring
- **Rate limiting** and security headers
- **Input validation** and sanitization
- **Error handling** and logging

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and responsive design
- **Socket.io Client** - Real-time communication
- **React Context API** - State management
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **js-cookie** - Cookie management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - Real-time communication
- **MongoDB with Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Winston** - Logging
- **Joi** - Input validation
- **express-rate-limit** - Rate limiting

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **ESLint & Prettier** - Code quality
- **Health checks** - Monitoring

## 📋 Prerequisites

- **Node.js 18+**
- **npm or yarn**
- **MongoDB** (local or cloud)
- **Docker** (for containerized deployment)

## 🚀 Quick Start

### Method 1: Docker Compose (Recommended)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd week-7-devops-deployment-assignment-princeulrichke
```

2. **Start the application:**
```bash
docker compose up --build
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Method 2: Manual Setup

1. **Clone and setup:**
```bash
git clone <repository-url>
cd week-7-devops-deployment-assignment-princeulrichke
```

2. **Backend setup:**
```bash
cd backend
npm install
npm run build
npm start
```

3. **Frontend setup (in a new terminal):**
```bash
cd frontend
npm install
npm run build
npm start
```

4. **MongoDB setup:**
- Install MongoDB locally or use MongoDB Atlas
- Update connection string in backend/.env

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📱 Usage

### Getting Started
1. **Register a new account** or **login** with existing credentials
2. **Create a group** using the "+" button in the sidebar
3. **Join existing groups** from the group list
4. **Start chatting** in real-time with other users
5. **Edit or delete** your messages using the message options

### Features Walkthrough

#### User Authentication
- Secure registration and login system
- JWT-based authentication
- Protected routes for authenticated users
- Automatic token refresh

#### Group Management
- Create public or private groups
- Join and leave groups
- Delete groups (group creators only)
- Real-time group updates

#### Real-time Messaging
- Instant message delivery
- Typing indicators
- Message editing and deletion
- User presence status
- Message timestamps

## 🏗️ Project Structure

```
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.io handlers
│   │   └── utils/           # Utility functions
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Next.js client application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Multi-container setup
├── .github/workflows/       # CI/CD pipelines
├── DEPLOYMENT.md           # Deployment guide
└── README.md
```

## 🔧 Development

### Running in Development Mode

1. **Backend (with hot reload):**
```bash
cd backend
npm run dev
```

2. **Frontend (with hot reload):**
```bash
cd frontend
npm run dev
```

### Building for Production

1. **Backend:**
```bash
cd backend
npm run build
npm start
```

2. **Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 🧪 Testing

### Health Checks
- Backend health: `GET /api/health`
- Database connectivity is verified automatically

### Manual Testing
1. Register multiple user accounts
2. Create groups and test messaging
3. Test real-time features (typing indicators, message updates)
4. Verify responsive design on different devices

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Docker deployment
- Cloud platforms (AWS, Heroku, Vercel)
- SSL setup
- Environment configuration
- Monitoring and scaling

### Quick Deploy Commands

```bash
# Production build and deploy
docker compose -f docker-compose.yml up --build -d

# View logs
docker compose logs -f

# Scale services
docker compose up --scale backend=3 frontend=2
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Security headers** with Helmet.js
- **Environment-based configuration**

## 🌟 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group
- `DELETE /api/groups/:id/leave` - Leave group
- `DELETE /api/groups/:id` - Delete group

### Messages
- `GET /api/messages/:groupId` - Get group messages
- `POST /api/messages/:groupId` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

### WebSocket Events
- `join-group` - Join a group room
- `leave-group` - Leave a group room
- `send-message` - Send a message
- `edit-message` - Edit a message
- `delete-message` - Delete a message
- `typing` - User typing indicator
- `stop-typing` - Stop typing indicator

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with love using the MERN stack
- Socket.io for real-time functionality
- Tailwind CSS for beautiful styling
- MongoDB for robust data storage

## 📞 Support

For issues and questions:
1. Check the [Deployment Guide](./DEPLOYMENT.md)
2. Review the API documentation above
3. Check the browser console and server logs
4. Open an issue in the repository

---

**Happy Chatting! 💬**
