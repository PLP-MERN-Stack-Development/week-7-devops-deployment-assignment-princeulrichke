#!/bin/bash

echo "🚀 MERN Chat App - Deployment Helper"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}This script will help you deploy your MERN chat application${NC}"
echo -e "${BLUE}Backend: Render | Frontend: Vercel${NC}"
echo ""

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Commit them first!${NC}"
    git status --short
    exit 1
fi

echo -e "${GREEN}✅ Git repository is clean${NC}"

# Build and test locally first
echo ""
echo -e "${BLUE}🔧 Building applications locally...${NC}"

# Build backend
echo "Building backend..."
cd backend
if npm run build; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd ../frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 All builds successful!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Push your code to GitHub: ${YELLOW}git push origin main${NC}"
echo "2. Deploy backend to Render using the DEPLOYMENT-GUIDE.md"
echo "3. Deploy frontend to Vercel using the DEPLOYMENT-GUIDE.md"
echo "4. Update CORS settings with your actual frontend URL"
echo ""
echo -e "${YELLOW}📖 See DEPLOYMENT-GUIDE.md for detailed instructions${NC}"
