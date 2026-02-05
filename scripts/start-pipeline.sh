#!/bin/bash
# Startup script for E-commerce Realtime Pipeline

echo "========================================================================"
echo "🚀 E-COMMERCE REALTIME PIPELINE - STARTUP SCRIPT"
echo "========================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
echo -e "${YELLOW}[1/5] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"
echo ""

# Check Java
echo -e "${YELLOW}[2/5] Checking Java...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Please install Java 11 or 17.${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✅ Java found: $JAVA_VERSION${NC}"
echo ""

# Check Python
echo -e "${YELLOW}[3/5] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found. Please install Python 3.8+.${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
echo ""

# Start Docker services
echo -e "${YELLOW}[4/5] Starting Docker services (Kafka + PostgreSQL)...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Docker services${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Wait for services
echo -e "${YELLOW}[5/5] Waiting for services to be ready (30 seconds)...${NC}"
sleep 30
echo -e "${GREEN}✅ Services should be ready${NC}"
echo ""

echo "========================================================================"
echo "✅ INFRASTRUCTURE READY!"
echo "========================================================================"
echo ""
echo "Next steps:"
echo "1️⃣  Start Event Generator:"
echo "   cd backend && source venv/bin/activate && python generator.py"
echo ""
echo "2️⃣  Start Spark Streaming (in another terminal):"
echo "   cd backend && source venv/bin/activate && python spark_stream.py"
echo ""
echo "3️⃣  Start Frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "📖 See docs/QUICKSTART.md for detailed steps"
echo "========================================================================"
