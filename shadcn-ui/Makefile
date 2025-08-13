# EduLearn Makefile
# A comprehensive build and deployment system for the EduLearn application

.PHONY: help install dev prod down clean build test lint format db-init db-reset db-backup db-restore deploy logs status health check-env

# Default target
help: ## Show this help message
	@echo "🚀 EduLearn Development & Deployment Commands"
	@echo "=============================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "📋 Quick Start:"
	@echo "  make install    # Install dependencies"
	@echo "  make dev        # Start development environment"
	@echo "  make prod       # Start production environment"
	@echo "  make down       # Stop all containers"
	@echo ""

# Environment setup
install: ## Install project dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed successfully"

check-env: ## Check if .env file exists and create from template if needed
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from template..."; \
		cp env.example .env; \
		echo "✅ .env file created. Please update it with your configuration."; \
	else \
		echo "✅ .env file already exists"; \
	fi

# Development commands
dev: check-env ## Start development environment with Docker
	@echo "🐳 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "🔍 Checking service status..."
	@make health
	@echo ""
	@echo "🎉 Development environment is ready!"
	@echo "📱 Access your application:"
	@echo "   - Main App: http://localhost:3000"
	@echo "   - Database Admin: http://localhost:5050 (admin@edulearn.com / admin123)"
	@echo ""

dev-build: check-env ## Build and start development environment
	@echo "🔨 Building development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "⏳ Waiting for services to be ready..."
	@sleep 15
	@make health

dev-logs: ## Show development environment logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-down: ## Stop development environment
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ Development environment stopped"

# Production commands
prod: check-env ## Start production environment with Docker
	@echo "🚀 Starting production environment..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 15
	@make health
	@echo ""
	@echo "🎉 Production environment is ready!"
	@echo "📱 Access your application: http://localhost:3000"

prod-build: check-env ## Build and start production environment
	@echo "🔨 Building production environment..."
	docker-compose up -d --build
	@echo "⏳ Waiting for services to be ready..."
	@sleep 20
	@make health

prod-logs: ## Show production environment logs
	docker-compose logs -f

prod-down: ## Stop production environment
	@echo "🛑 Stopping production environment..."
	docker-compose down
	@echo "✅ Production environment stopped"

# General Docker commands
down: ## Stop all containers (both dev and prod)
	@echo "🛑 Stopping all containers..."
	docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	docker-compose down 2>/dev/null || true
	@echo "✅ All containers stopped"

clean: ## Remove all containers, images, and volumes
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v --rmi all 2>/dev/null || true
	docker-compose down -v --rmi all 2>/dev/null || true
	docker system prune -f
	@echo "✅ Cleanup completed"

build: ## Build Docker image
	@echo "🔨 Building Docker image..."
	docker build -t edulearn .
	@echo "✅ Docker image built successfully"

# Database commands
db-init: ## Initialize database schema and seed data
	@echo "🗄️ Initializing database..."
	@if docker ps | grep -q edulearn-postgres; then \
		echo "Database container is running, initializing..."; \
		curl -X POST http://localhost:3000/api/init-database || echo "API endpoint not available, using direct database connection"; \
	else \
		echo "❌ Database container is not running. Start the environment first with 'make dev' or 'make prod'"; \
	fi

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "⚠️  WARNING: This will delete all database data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "🗄️ Resetting database..."; \
		docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true; \
		docker-compose down -v 2>/dev/null || true; \
		echo "✅ Database reset completed. Run 'make dev' or 'make prod' to restart."; \
	else \
		echo "❌ Database reset cancelled."; \
	fi

db-backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@if docker ps | grep -q edulearn-postgres; then \
		docker exec edulearn-postgres pg_dump -U edulearn_user edulearn > backup_$$(date +%Y%m%d_%H%M%S).sql; \
		echo "✅ Database backup created: backup_$$(date +%Y%m%d_%H%M%S).sql"; \
	else \
		echo "❌ Database container is not running"; \
	fi

db-restore: ## Restore database from backup file
	@echo "📥 Restoring database from backup..."
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify backup file: make db-restore BACKUP_FILE=backup_20231201_120000.sql"; \
	else \
		if docker ps | grep -q edulearn-postgres; then \
			docker exec -i edulearn-postgres psql -U edulearn_user edulearn < $(BACKUP_FILE); \
			echo "✅ Database restored from $(BACKUP_FILE)"; \
		else \
			echo "❌ Database container is not running"; \
		fi \
	fi

# Testing and quality
test: ## Run tests
	@echo "🧪 Running tests..."
	npm test

lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	npm run lint

format: ## Format code with Prettier
	@echo "✨ Formatting code..."
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# Monitoring and status
logs: ## Show logs from all containers
	@echo "📋 Showing logs from all containers..."
	docker-compose -f docker-compose.dev.yml logs -f 2>/dev/null || docker-compose logs -f

status: ## Show status of all containers
	@echo "📊 Container Status:"
	@echo "==================="
	docker-compose -f docker-compose.dev.yml ps 2>/dev/null || docker-compose ps

health: ## Check health of all services
	@echo "🏥 Health Check:"
	@echo "==============="
	@if docker ps | grep -q edulearn-postgres; then \
		if docker exec edulearn-postgres pg_isready -U edulearn_user -d edulearn >/dev/null 2>&1; then \
			echo "✅ PostgreSQL: Healthy"; \
		else \
			echo "❌ PostgreSQL: Unhealthy"; \
		fi \
	else \
		echo "❌ PostgreSQL: Not running"; \
	fi
	@if docker ps | grep -q edulearn-redis; then \
		if docker exec edulearn-redis redis-cli ping >/dev/null 2>&1; then \
			echo "✅ Redis: Healthy"; \
		else \
			echo "❌ Redis: Unhealthy"; \
		fi \
	else \
		echo "❌ Redis: Not running"; \
	fi
	@if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then \
		echo "✅ Application: Healthy"; \
	else \
		echo "❌ Application: Not responding"; \
	fi

# Deployment commands
deploy: ## Deploy to Vercel (requires Vercel CLI)
	@echo "🚀 Deploying to Vercel..."
	@if command -v vercel >/dev/null 2>&1; then \
		vercel --prod; \
	else \
		echo "❌ Vercel CLI not found. Install with: npm i -g vercel"; \
	fi

deploy-dev: ## Deploy to Vercel (development)
	@echo "🚀 Deploying to Vercel (development)..."
	@if command -v vercel >/dev/null 2>&1; then \
		vercel; \
	else \
		echo "❌ Vercel CLI not found. Install with: npm i -g vercel"; \
	fi

# Utility commands
shell: ## Open shell in application container
	@echo "🐚 Opening shell in application container..."
	@if docker ps | grep -q edulearn-app; then \
		docker exec -it edulearn-app sh; \
	elif docker ps | grep -q edulearn-app-dev; then \
		docker exec -it edulearn-app-dev sh; \
	else \
		echo "❌ Application container is not running"; \
	fi

db-shell: ## Open PostgreSQL shell
	@echo "🐚 Opening PostgreSQL shell..."
	@if docker ps | grep -q edulearn-postgres; then \
		docker exec -it edulearn-postgres psql -U edulearn_user -d edulearn; \
	elif docker ps | grep -q edulearn-postgres-dev; then \
		docker exec -it edulearn-postgres-dev psql -U edulearn_user -d edulearn_dev; \
	else \
		echo "❌ PostgreSQL container is not running"; \
	fi

redis-cli: ## Open Redis CLI
	@echo "🐚 Opening Redis CLI..."
	@if docker ps | grep -q edulearn-redis; then \
		docker exec -it edulearn-redis redis-cli; \
	elif docker ps | grep -q edulearn-redis-dev; then \
		docker exec -it edulearn-redis-dev redis-cli; \
	else \
		echo "❌ Redis container is not running"; \
	fi

# Quick commands
start: dev ## Alias for dev
stop: down ## Alias for down
restart: down dev ## Restart development environment
restart-prod: prod-down prod ## Restart production environment

# Windows compatibility (if using Git Bash or similar)
win-dev: ## Windows-compatible development start
	@echo "🐳 Starting development environment (Windows)..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	@timeout /t 10 /nobreak >nul 2>&1 || sleep 10
	@echo "🔍 Checking service status..."
	@make health

win-prod: ## Windows-compatible production start
	@echo "🚀 Starting production environment (Windows)..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@timeout /t 15 /nobreak >nul 2>&1 || sleep 15
	@make health
