#!/bin/bash

echo "🧪 Testing Deployment Configuration"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error_count=0

# Check if required files exist
echo -e "${BLUE}📁 Checking required files...${NC}"

files_to_check=(
    "backend/package.json"
    "frontend/package.json"
    "backend/src/server.ts"
    "frontend/next.config.js"
    "render.yaml"
    "vercel.json"
    "DEPLOYMENT-GUIDE.md"
    "backend/.env.production.example"
    "frontend/.env.production.example"
)

for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ((error_count++))
    fi
done

# Check package.json scripts
echo ""
echo -e "${BLUE}🔧 Checking backend scripts...${NC}"

if grep -q '"start".*"node dist/server.js"' backend/package.json; then
    echo -e "${GREEN}✅ Backend start script configured${NC}"
else
    echo -e "${RED}❌ Backend start script not configured correctly${NC}"
    ((error_count++))
fi

if grep -q '"build".*"tsc"' backend/package.json; then
    echo -e "${GREEN}✅ Backend build script configured${NC}"
else
    echo -e "${RED}❌ Backend build script not configured correctly${NC}"
    ((error_count++))
fi

# Check Next.js config
echo ""
echo -e "${BLUE}⚛️  Checking frontend configuration...${NC}"

if grep -q 'output.*standalone' frontend/next.config.js; then
    echo -e "${GREEN}✅ Next.js standalone output configured${NC}"
else
    echo -e "${YELLOW}⚠️  Next.js standalone output not found (recommended for Vercel)${NC}"
fi

# Check environment variable templates
echo ""
echo -e "${BLUE}🔐 Checking environment templates...${NC}"

if grep -q "MONGODB_URI" backend/.env.production.example; then
    echo -e "${GREEN}✅ Backend environment template has MONGODB_URI${NC}"
else
    echo -e "${RED}❌ Backend environment template missing MONGODB_URI${NC}"
    ((error_count++))
fi

if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.production.example; then
    echo -e "${GREEN}✅ Frontend environment template has API URL${NC}"
else
    echo -e "${RED}❌ Frontend environment template missing API URL${NC}"
    ((error_count++))
fi

# Test builds
echo ""
echo -e "${BLUE}🏗️  Testing builds...${NC}"

echo "Testing backend build..."
cd backend
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Backend builds successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    ((error_count++))
fi

echo "Testing frontend build..."
cd ../frontend
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Frontend builds successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    ((error_count++))
fi

cd ..

# Summary
echo ""
echo "=================================="
if [[ $error_count -eq 0 ]]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Commit and push your changes"
    echo "2. Follow the DEPLOYMENT-GUIDE.md"
    echo "3. Deploy to Render (backend) and Vercel (frontend)"
else
    echo -e "${RED}❌ Found $error_count issues. Please fix them before deploying.${NC}"
    exit 1
fi
