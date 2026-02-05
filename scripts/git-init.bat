@echo off
REM Git initialization script for E-commerce Realtime Pipeline

echo ======================================================================
echo 🚀 GIT INITIALIZATION SCRIPT
echo ======================================================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first:
    echo    https://git-scm.com/download/win
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
echo ✅ Git found: %GIT_VERSION%
echo.

REM Check if already initialized
if exist ".git" (
    echo ⚠️  Git repository already initialized!
    echo.
    set /p continue="Do you want to continue? (y/n): "
    if /i not "%continue%"=="y" exit /b 0
) else (
    REM Initialize git
    echo 📦 Initializing git repository...
    git init
    echo ✅ Git initialized
    echo.
)

REM Check git config
git config user.name >nul 2>&1
if errorlevel 1 (
    echo ⚙️  Setting up Git user config...
    set /p git_name="Enter your name: "
    set /p git_email="Enter your email: "
    git config --global user.name "%git_name%"
    git config --global user.email "%git_email%"
    echo ✅ Git config set
    echo.
)

REM Add all files
echo 📁 Adding files to git...
git add .

REM Show status
echo.
echo 📊 Git status:
git status --short

REM Create initial commit
echo.
set /p create_commit="Create initial commit? (y/n): "
if /i "%create_commit%"=="y" (
    git commit -m "Initial commit: E-commerce Realtime Pipeline" -m "- Full-stack realtime data pipeline" -m "- Backend: Kafka + Spark Structured Streaming + PostgreSQL" -m "- Frontend: React + Vite + TypeScript + TailwindCSS" -m "- Docs: QUICKSTART, BACKEND_SETUP, ARCHITECTURE" -m "- Scripts: Startup helpers for Windows & Linux"
    echo ✅ Initial commit created
)

REM Remote setup
echo.
echo ======================================================================
echo Next Steps:
echo ======================================================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Add remote and push:
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 📖 See docs\GITHUB_SETUP.md for detailed guide
echo ======================================================================
pause
