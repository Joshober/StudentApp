#!/bin/bash

# EduLearn Quick Start Script
echo "🚀 Starting EduLearn Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start development environment
echo "🐳 Starting development environment..."
npm run docker:dev

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."

# Check PostgreSQL
if docker exec edulearn-postgres-dev pg_isready -U edulearn_user -d edulearn_dev > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker exec edulearn-redis-dev redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

echo ""
echo "🎉 EduLearn is starting up!"
echo ""
echo "📱 Access your application:"
echo "   - Main App: http://localhost:3000"
echo "   - Database Admin: http://localhost:5050"
echo "     (admin@edulearn.com / admin123)"
echo ""
echo "🛑 To stop the application:"
echo "   npm run docker:dev:down"
echo ""
echo "📚 For more information, see DEPLOYMENT.md"
