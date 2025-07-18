# 🚀 MERN Chat App Deployment Guide

This guide will help you deploy your MERN stack chat application with the backend on Render and frontend on Vercel.

## Prerequisites

### 1. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Sandbox - Free tier)
3. Create a database user:
   - Database Access → Add New Database User
   - Username/Password authentication
   - Built-in role: Read and write to any database
4. Network Access:
   - Add IP Access List Entry
   - Allow access from anywhere: `0.0.0.0/0` (for production)
5. Get your connection string:
   - Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password

### 2. Account Setup
- [Render Account](https://render.com) - For backend deployment
- [Vercel Account](https://vercel.com) - For frontend deployment

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Environment Variables

Before deploying, prepare these environment variables for Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_minimum_64_characters_long_random_string
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Important:**
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (minimum 64 characters)
- We'll update `CORS_ORIGIN` later with the actual frontend URL

### Step 2: Deploy to Render

1. **Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up or login
   - Connect your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch (main)

3. **Configure Service**
   ```
   Name: mern-chat-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables**
   - Go to Environment tab
   - Add all the environment variables from Step 1
   - Set `CORS_ORIGIN=*` temporarily (we'll update this later)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-app-name.onrender.com`

6. **Verify Deployment**
   - Visit: `https://your-app-name.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

Create environment variables for Vercel using your Render backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-app.onrender.com
```

### Step 2: Deploy to Vercel

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or login with GitHub

2. **Import Project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node.js Version: 18.x
   ```

4. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add the environment variables from Step 1
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (5-10 minutes)
   - Note your frontend URL: `https://your-app-name.vercel.app`

## 🔄 Post-Deployment Configuration

### Step 1: Update CORS Settings

1. **Update Render Environment Variables**
   - Go to Render Dashboard → Your Service → Environment
   - Update `CORS_ORIGIN` to your Vercel URL:
     ```
     CORS_ORIGIN=https://your-app-name.vercel.app
     ```
   - Save and redeploy

### Step 2: Update Vercel Configuration (if needed)

If you need to update API URLs:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the URLs if they changed
3. Redeploy from the Deployments tab

## ✅ Testing Your Deployment

### 1. Backend Health Check
Visit: `https://your-backend-app.onrender.com/health`
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "uptime": 123.456
}
```

### 2. Frontend Functionality
1. **Registration**: Create a new account
2. **Login**: Sign in with credentials
3. **Groups**: Create and join groups
4. **Messaging**: Send and receive real-time messages
5. **Socket.io**: Check browser console for connection logs

### 3. Real-time Features
- Typing indicators
- Online status
- Message delivery
- Group notifications

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGIN` in Render environment variables
   - Ensure it matches your Vercel frontend URL exactly
   - Check browser console for specific error messages

2. **Socket.io Connection Failed**
   - Verify `NEXT_PUBLIC_SOCKET_URL` in Vercel
   - Check browser Network tab for WebSocket connections
   - Ensure backend is accessible

3. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check Network Access settings (0.0.0.0/0)
   - Verify database user permissions

4. **Build Failures**
   - Check Render/Vercel build logs
   - Verify all dependencies are in package.json
   - Check TypeScript compilation errors

5. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check if variables are set for correct environment
   - Redeploy after adding new variables

### Debug Commands

Check logs in Render:
- Go to your service → Logs tab
- Filter by Error/Warning levels

Check Vercel function logs:
- Go to your project → Functions tab
- Click on any function to see logs

## 🚀 Production Optimization

### Performance
- Enable gzip compression (already configured)
- Use CDN for static assets (Vercel handles this)
- Optimize images and bundle size

### Security
- Use strong JWT secrets (64+ characters)
- Enable HTTPS everywhere (automatic on Render/Vercel)
- Implement rate limiting (already configured)

### Monitoring
- Set up uptime monitoring for your backend
- Monitor application performance
- Set up error tracking (optional)

## 📱 Domain Configuration (Optional)

### Custom Domain for Frontend (Vercel)
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain for Backend (Render)
1. Render Dashboard → Your Service → Settings
2. Add custom domain
3. Configure DNS records as instructed

## 🔄 Continuous Deployment

Both Render and Vercel automatically deploy when you push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Deployments trigger automatically
4. Monitor deployment status in respective dashboards

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Render/Vercel dashboards
3. Verify all environment variables are set correctly
4. Test locally to isolate deployment-specific issues

---

**🎉 Congratulations!** Your MERN chat application is now live and ready for users!

- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-backend-app.onrender.com`
- Health Check: `https://your-backend-app.onrender.com/health`
