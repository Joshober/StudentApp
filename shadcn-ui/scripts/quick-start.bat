@echo off
REM EduLearn Quick Start Script for Windows

echo 🚀 Starting EduLearn Application...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please update it with your configuration.
)

REM Start development environment
echo 🐳 Starting development environment...
npm run docker:dev

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...

REM Check PostgreSQL
docker exec edulearn-postgres-dev pg_isready -U edulearn_user -d edulearn_dev >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not ready
) else (
    echo ✅ PostgreSQL is ready
)

REM Check Redis
docker exec edulearn-redis-dev redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis is not ready
) else (
    echo ✅ Redis is ready
)

echo.
echo 🎉 EduLearn is starting up!
echo.
echo 📱 Access your application:
echo    - Main App: http://localhost:3000
echo    - Database Admin: http://localhost:5050
echo      (admin@edulearn.com / admin123)
echo.
echo 🛑 To stop the application:
echo    npm run docker:dev:down
echo.
echo 📚 For more information, see DEPLOYMENT.md
pause
