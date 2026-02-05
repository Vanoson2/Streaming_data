#!/bin/bash
# Git initialization script for E-commerce Realtime Pipeline

echo "======================================================================"
echo "🚀 GIT INITIALIZATION SCRIPT"
echo "======================================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   https://git-scm.com/download"
    exit 1
fi

echo "✅ Git found: $(git --version)"
echo ""

# Check if already initialized
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized!"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    # Initialize git
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check git config
if ! git config user.name &> /dev/null; then
    echo "⚙️  Setting up Git user config..."
    read -p "Enter your name: " git_name
    read -p "Enter your email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    echo "✅ Git config set"
    echo ""
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Show status
echo ""
echo "📊 Git status:"
git status --short

# Create initial commit
echo ""
read -p "Create initial commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: E-commerce Realtime Pipeline

- Full-stack realtime data pipeline
- Backend: Kafka + Spark Structured Streaming + PostgreSQL
- Frontend: React + Vite + TypeScript + TailwindCSS
- Docs: QUICKSTART, BACKEND_SETUP, ARCHITECTURE
- Scripts: Startup helpers for Windows & Linux"
    echo "✅ Initial commit created"
fi

# Remote setup
echo ""
echo "======================================================================"
echo "Next Steps:"
echo "======================================================================"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Add remote and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "📖 See docs/GITHUB_SETUP.md for detailed guide"
echo "======================================================================"
