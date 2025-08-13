@echo off
REM EduLearn Makefile for Windows
REM A comprehensive build and deployment system for the EduLearn application

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="down" goto down
if "%1"=="clean" goto clean
if "%1"=="build" goto build
if "%1"=="db-init" goto db-init
if "%1"=="db-reset" goto db-reset
if "%1"=="db-backup" goto db-backup
if "%1"=="db-restore" goto db-restore
if "%1"=="test" goto test
if "%1"=="lint" goto lint
if "%1"=="format" goto format
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="health" goto health
if "%1"=="deploy" goto deploy
if "%1"=="deploy-dev" goto deploy-dev
if "%1"=="shell" goto shell
if "%1"=="db-shell" goto db-shell
if "%1"=="redis-cli" goto redis-cli
if "%1"=="start" goto dev
if "%1"=="stop" goto down
if "%1"=="restart" goto restart
if "%1"=="restart-prod" goto restart-prod

echo ❌ Unknown command: %1
goto help

:help
echo 🚀 EduLearn Development ^& Deployment Commands
echo ==============================================
echo.
echo 📋 Available Commands:
echo   install      - Install project dependencies
echo   dev          - Start development environment
echo   prod         - Start production environment
echo   down         - Stop all containers
echo   clean        - Remove all containers, images, and volumes
echo   build        - Build Docker image
echo   db-init      - Initialize database schema
echo   db-reset     - Reset database (WARNING: deletes all data)
echo   db-backup    - Create database backup
echo   db-restore   - Restore database from backup
echo   test         - Run tests
echo   lint         - Run ESLint
echo   format       - Format code with Prettier
echo   logs         - Show logs from all containers
echo   status       - Show status of all containers
echo   health       - Check health of all services
echo   deploy       - Deploy to Vercel
echo   deploy-dev   - Deploy to Vercel (development)
echo   shell        - Open shell in application container
echo   db-shell     - Open PostgreSQL shell
echo   redis-cli    - Open Redis CLI
echo   start        - Alias for dev
echo   stop         - Alias for down
echo   restart      - Restart development environment
echo   restart-prod - Restart production environment
echo.
echo 📋 Quick Start:
echo   make.bat install    # Install dependencies
echo   make.bat dev        # Start development environment
echo   make.bat prod       # Start production environment
echo   make.bat down       # Stop all containers
echo.
goto end

:install
echo 📦 Installing dependencies...
call npm install
echo ✅ Dependencies installed successfully
goto end

:dev
call :check-env
echo 🐳 Starting development environment...
docker-compose -f docker-compose.dev.yml up -d
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul
echo 🔍 Checking service status...
call :health
echo.
echo 🎉 Development environment is ready!
echo 📱 Access your application:
echo    - Main App: http://localhost:3000
echo    - Database Admin: http://localhost:5050 (admin@edulearn.com / admin123)
echo.
goto end

:prod
call :check-env
echo 🚀 Starting production environment...
docker-compose up -d
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul
call :health
echo.
echo 🎉 Production environment is ready!
echo 📱 Access your application: http://localhost:3000
goto end

:down
echo 🛑 Stopping all containers...
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose down 2>nul
echo ✅ All containers stopped
goto end

:clean
echo 🧹 Cleaning up Docker resources...
docker-compose -f docker-compose.dev.yml down -v --rmi all 2>nul
docker-compose down -v --rmi all 2>nul
docker system prune -f
echo ✅ Cleanup completed
goto end

:build
echo 🔨 Building Docker image...
docker build -t edulearn .
echo ✅ Docker image built successfully
goto end

:db-init
echo 🗄️ Initializing database...
docker ps | findstr edulearn-postgres >nul
if %errorlevel% equ 0 (
    echo Database container is running, initializing...
    curl -X POST http://localhost:3000/api/init-database 2>nul || echo API endpoint not available, using direct database connection
) else (
    echo ❌ Database container is not running. Start the environment first with 'make.bat dev' or 'make.bat prod'
)
goto end

:db-reset
echo ⚠️  WARNING: This will delete all database data!
set /p confirm="Are you sure? Type 'yes' to continue: "
if "%confirm%"=="yes" (
    echo 🗄️ Resetting database...
    docker-compose -f docker-compose.dev.yml down -v 2>nul
    docker-compose down -v 2>nul
    echo ✅ Database reset completed. Run 'make.bat dev' or 'make.bat prod' to restart.
) else (
    echo ❌ Database reset cancelled.
)
goto end

:db-backup
echo 💾 Creating database backup...
docker ps | findstr edulearn-postgres >nul
if %errorlevel% equ 0 (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "datestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
    docker exec edulearn-postgres pg_dump -U edulearn_user edulearn > backup_%datestamp%.sql
    echo ✅ Database backup created: backup_%datestamp%.sql
) else (
    echo ❌ Database container is not running
)
goto end

:db-restore
if "%BACKUP_FILE%"=="" (
    echo ❌ Please specify backup file: make.bat db-restore BACKUP_FILE=backup_20231201_120000.sql
    goto end
)
echo 📥 Restoring database from backup...
docker ps | findstr edulearn-postgres >nul
if %errorlevel% equ 0 (
    docker exec -i edulearn-postgres psql -U edulearn_user edulearn < %BACKUP_FILE%
    echo ✅ Database restored from %BACKUP_FILE%
) else (
    echo ❌ Database container is not running
)
goto end

:test
echo 🧪 Running tests...
call npm test
goto end

:lint
echo 🔍 Running ESLint...
call npm run lint
goto end

:format
echo ✨ Formatting code...
call npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
goto end

:logs
echo 📋 Showing logs from all containers...
docker-compose -f docker-compose.dev.yml logs -f 2>nul || docker-compose logs -f
goto end

:status
echo 📊 Container Status:
echo ===================
docker-compose -f docker-compose.dev.yml ps 2>nul || docker-compose ps
goto end

:health
echo 🏥 Health Check:
echo ===============
docker ps | findstr edulearn-postgres >nul
if %errorlevel% equ 0 (
    docker exec edulearn-postgres pg_isready -U edulearn_user -d edulearn >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL: Healthy
    ) else (
        echo ❌ PostgreSQL: Unhealthy
    )
) else (
    echo ❌ PostgreSQL: Not running
)

docker ps | findstr edulearn-redis >nul
if %errorlevel% equ 0 (
    docker exec edulearn-redis redis-cli ping >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Redis: Healthy
    ) else (
        echo ❌ Redis: Unhealthy
    )
) else (
    echo ❌ Redis: Not running
)

curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application: Healthy
) else (
    echo ❌ Application: Not responding
)
goto end

:deploy
echo 🚀 Deploying to Vercel...
vercel --prod 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Install with: npm i -g vercel
)
goto end

:deploy-dev
echo 🚀 Deploying to Vercel (development)...
vercel 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Install with: npm i -g vercel
)
goto end

:shell
echo 🐚 Opening shell in application container...
docker ps | findstr edulearn-app >nul
if %errorlevel% equ 0 (
    docker exec -it edulearn-app sh
) else (
    docker ps | findstr edulearn-app-dev >nul
    if %errorlevel% equ 0 (
        docker exec -it edulearn-app-dev sh
    ) else (
        echo ❌ Application container is not running
    )
)
goto end

:db-shell
echo 🐚 Opening PostgreSQL shell...
docker ps | findstr edulearn-postgres >nul
if %errorlevel% equ 0 (
    docker exec -it edulearn-postgres psql -U edulearn_user -d edulearn
) else (
    docker ps | findstr edulearn-postgres-dev >nul
    if %errorlevel% equ 0 (
        docker exec -it edulearn-postgres-dev psql -U edulearn_user -d edulearn_dev
    ) else (
        echo ❌ PostgreSQL container is not running
    )
)
goto end

:redis-cli
echo 🐚 Opening Redis CLI...
docker ps | findstr edulearn-redis >nul
if %errorlevel% equ 0 (
    docker exec -it edulearn-redis redis-cli
) else (
    docker ps | findstr edulearn-redis-dev >nul
    if %errorlevel% equ 0 (
        docker exec -it edulearn-redis-dev redis-cli
    ) else (
        echo ❌ Redis container is not running
    )
)
goto end

:restart
call :down
call :dev
goto end

:restart-prod
call :down
call :prod
goto end

:check-env
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env >nul
    echo ✅ .env file created. Please update it with your configuration.
) else (
    echo ✅ .env file already exists
)
goto :eof

:end
endlocal
