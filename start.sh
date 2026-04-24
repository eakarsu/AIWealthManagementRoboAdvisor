#!/bin/bash

echo "=============================================="
echo "  AI Wealth Management Robo-Advisor"
echo "  Starting Application..."
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill any processes on our ports
echo -e "\n${YELLOW}Cleaning up ports...${NC}"
for PORT in 4000 3000; do
  PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null
  fi
done
sleep 1

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
  sleep 2
fi

if pg_isready -q 2>/dev/null; then
  echo -e "  ${GREEN}PostgreSQL is running${NC}"
else
  echo -e "  ${RED}PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME=${DB_NAME:-wealth_advisor}
DB_USER=${DB_USER:-$(whoami)}

# Create database if not exists
echo -e "\n${YELLOW}Setting up database...${NC}"
psql -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
  createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null

if psql -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1; then
  echo -e "  ${GREEN}Database '$DB_NAME' ready${NC}"
else
  echo -e "  ${RED}Failed to create database. Check PostgreSQL user permissions.${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install --silent 2>/dev/null
echo -e "  ${GREEN}Server dependencies installed${NC}"

cd client
npm install --silent 2>/dev/null
echo -e "  ${GREEN}Client dependencies installed${NC}"
cd ..

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
node server/seeds/seed.js
if [ $? -eq 0 ]; then
  echo -e "  ${GREEN}Database seeded successfully${NC}"
else
  echo -e "  ${RED}Seed failed. Check database connection.${NC}"
fi

# Start application with hot reload
echo -e "\n${GREEN}=============================================="
echo -e "  Starting Application with Hot Reload"
echo -e "==============================================${NC}"
echo -e "  ${BLUE}Backend:${NC}  http://localhost:4000"
echo -e "  ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "  ${BLUE}Login:${NC}    admin@wealthadvisor.com / password123"
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}\n"

# Start both server and client with hot reload
npm run dev
