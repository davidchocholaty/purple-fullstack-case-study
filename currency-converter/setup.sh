#!/bin/bash

# Purple Currency Converter - Setup Script
# Automates installation and configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
  echo -e "${BLUE}==>${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Purple Currency Converter - Setup Script           ║"
echo "╔═══════════════════════════════════════════════════════╗"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed"
  echo "Please install Node.js v22.11.0 or higher from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed"
  exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm found: v$NPM_VERSION"

echo ""

# Install all dependencies using npm workspaces
print_step "Installing dependencies for both frontend and backend..."
npm install
print_success "All dependencies installed"

cd backend

# Check for .env file
if [ ! -f .env ]; then
  print_warning ".env file not found in backend/"
  echo ""
  echo "Creating .env file..."
  echo "# OpenExchangeRates API Configuration" > .env
  echo "OXR_APP_ID=your_api_key_here" >> .env
  echo "" >> .env
  echo "# Optional Configuration" >> .env
  echo "# PORT=4000" >> .env
  echo "# CORS_ORIGIN=http://localhost:3000" >> .env
  echo "# NODE_ENV=development" >> .env
  
  print_success "Created .env template"
  echo ""
  print_warning "IMPORTANT: You need to add your OpenExchangeRates API key!"
  echo ""
  echo "1. Sign up for a free API key at: https://openexchangerates.org/"
  echo "2. Edit backend/.env and replace 'your_api_key_here' with your actual API key"
  echo ""
  
  # Ask if user wants to enter API key now
  read -p "Do you have your API key now? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your OpenExchangeRates API key: " API_KEY
    sed -i "s/your_api_key_here/$API_KEY/" .env
    print_success "API key saved to .env"
  else
    print_warning "Remember to add your API key to backend/.env before running the app!"
  fi
else
  print_success ".env file already exists"
fi

cd ..

echo ""

# Final instructions
echo "╔═══════════════════════════════════════════════════════╗"
echo "║              Setup Complete!                          ║"
echo "╔═══════════════════════════════════════════════════════╗"
echo ""

if [ ! -f backend/.env ] || grep -q "your_api_key_here" backend/.env 2>/dev/null; then
  print_warning "Don't forget to configure your API key in backend/.env"
  echo ""
fi

echo "To run the application:"
echo ""
echo "  ${GREEN}npm run dev${NC}"
echo ""
echo "This will start both backend and frontend simultaneously."
echo ""
echo "  • Backend:  ${BLUE}http://localhost:4000${NC}"
echo "  • Frontend: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Or run them separately:"
echo "  • Backend only:  ${GREEN}npm run dev:backend${NC}"
echo "  • Frontend only: ${GREEN}npm run dev:frontend${NC}"
echo ""
echo "For more information, see README.md"
echo ""

