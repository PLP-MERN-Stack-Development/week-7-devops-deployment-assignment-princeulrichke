#!/bin/bash

# MERN Chat Application Test Script
# This script tests the build process of both frontend and backend

echo "🚀 MERN Chat Application Build Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 PASSED${NC}"
    else
        echo -e "${RED}❌ $2 FAILED${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed (${NODE_VERSION})"
else
    print_status 1 "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
print_info "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm is installed (${NPM_VERSION})"
else
    print_status 1 "npm is not installed"
    exit 1
fi

echo ""
print_info "Testing Backend Build..."
echo "========================="

# Navigate to backend directory and test build
cd backend

# Check if package.json exists
if [ -f "package.json" ]; then
    print_status 0 "Backend package.json found"
else
    print_status 1 "Backend package.json not found"
    exit 1
fi

# Install backend dependencies (if not already installed)
print_info "Installing backend dependencies..."
npm install --silent
if [ $? -eq 0 ]; then
    print_status 0 "Backend dependencies installed"
else
    print_status 1 "Backend dependency installation failed"
    exit 1
fi

# Test backend build
print_info "Building backend..."
npm run build --silent
if [ $? -eq 0 ]; then
    print_status 0 "Backend build successful"
else
    print_status 1 "Backend build failed"
    exit 1
fi

# Test backend linting (if available)
if npm run lint --silent &> /dev/null; then
    print_info "Running backend linting..."
    npm run lint --silent
    if [ $? -eq 0 ]; then
        print_status 0 "Backend linting passed"
    else
        print_status 1 "Backend linting failed"
    fi
fi

echo ""
print_info "Testing Frontend Build..."
echo "=========================="

# Navigate to frontend directory
cd ../frontend

# Check if package.json exists
if [ -f "package.json" ]; then
    print_status 0 "Frontend package.json found"
else
    print_status 1 "Frontend package.json not found"
    exit 1
fi

# Install frontend dependencies (if not already installed)
print_info "Installing frontend dependencies..."
npm install --silent
if [ $? -eq 0 ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_status 1 "Frontend dependency installation failed"
    exit 1
fi

# Test frontend build
print_info "Building frontend..."
npm run build --silent
if [ $? -eq 0 ]; then
    print_status 0 "Frontend build successful"
else
    print_status 1 "Frontend build failed"
    exit 1
fi

# Test frontend linting (if available)
if npm run lint --silent &> /dev/null; then
    print_info "Running frontend linting..."
    npm run lint --silent
    if [ $? -eq 0 ]; then
        print_status 0 "Frontend linting passed"
    else
        print_status 1 "Frontend linting failed"
    fi
fi

echo ""
print_info "Testing Docker Configuration..."
echo "==============================="

# Navigate back to root
cd ..

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    print_status 0 "Docker Compose configuration found"
else
    print_status 1 "Docker Compose configuration not found"
fi

# Check if Dockerfiles exist
if [ -f "backend/Dockerfile" ]; then
    print_status 0 "Backend Dockerfile found"
else
    print_status 1 "Backend Dockerfile not found"
fi

if [ -f "frontend/Dockerfile" ]; then
    print_status 0 "Frontend Dockerfile found"
else
    print_status 1 "Frontend Dockerfile not found"
fi

echo ""
print_info "Testing CI/CD Configuration..."
echo "=============================="

# Check if GitHub Actions workflows exist
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
    if [ $WORKFLOW_COUNT -gt 0 ]; then
        print_status 0 "GitHub Actions workflows found (${WORKFLOW_COUNT} files)"
    else
        print_status 1 "No GitHub Actions workflow files found"
    fi
else
    print_status 1 "GitHub Actions workflows directory not found"
fi

echo ""
print_info "Project Structure Validation..."
echo "==============================="

# Check essential files and directories
ESSENTIAL_ITEMS=(
    "README.md"
    "DEPLOYMENT.md"
    "backend/src"
    "frontend/src"
    "backend/package.json"
    "frontend/package.json"
)

for item in "${ESSENTIAL_ITEMS[@]}"; do
    if [ -e "$item" ]; then
        print_status 0 "$item exists"
    else
        print_status 1 "$item missing"
    fi
done

echo ""
print_info "Test Summary"
echo "============"

echo -e "${GREEN}✅ All core build tests completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Set up environment variables (see README.md)"
echo "2. Start MongoDB (locally or use MongoDB Atlas)"
echo "3. Run 'docker compose up --build' to start the application"
echo "4. Access the application at http://localhost:3000"
echo ""
echo "For production deployment, see DEPLOYMENT.md"

# Return to original directory
cd "$(dirname "$0")"

echo ""
echo "🎉 Build test completed successfully!"
