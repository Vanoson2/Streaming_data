@echo off
REM Startup script for E-commerce Realtime Pipeline (Windows)

echo ========================================================================
echo 🚀 E-COMMERCE REALTIME PIPELINE - STARTUP SCRIPT
echo ========================================================================
echo.

REM Check Docker
echo [1/5] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker Desktop.
    exit /b 1
)
echo ✅ Docker found
echo.

REM Check Java
echo [2/5] Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found. Please install Java 11 or 17.
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
echo ✅ Java found: %JAVA_VERSION%
echo.

REM Check Python
echo [3/5] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+.
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ Python found: %PYTHON_VERSION%
echo.

REM Start Docker services
echo [4/5] Starting Docker services (Kafka + PostgreSQL)...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start Docker services
    exit /b 1
)
echo ✅ Docker services started
echo.

REM Wait for services
echo [5/5] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak >nul
echo ✅ Services should be ready
echo.

echo ========================================================================
echo ✅ INFRASTRUCTURE READY!
echo ========================================================================
echo.
echo Next steps:
echo 1️⃣  Start Event Generator:
echo    cd backend ^&^& venv\Scripts\activate ^&^& python generator.py
echo.
echo 2️⃣  Start Spark Streaming (in another terminal):
echo    cd backend ^&^& venv\Scripts\activate ^&^& python spark_stream.py
echo.
echo 3️⃣  Start Frontend (in another terminal):
echo    npm run dev
echo.
echo 📖 See docs\QUICKSTART.md for detailed steps
echo ========================================================================
pause
