# Makefile Quick Reference

## 🚀 Quick Start Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install project dependencies |
| `make dev` | Start development environment |
| `make prod` | Start production environment |
| `make down` | Stop all containers |

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment |
| `make dev-build` | Build and start development environment |
| `make dev-logs` | Show development environment logs |
| `make dev-down` | Stop development environment |
| `make prod` | Start production environment |
| `make prod-build` | Build and start production environment |
| `make prod-logs` | Show production environment logs |
| `make prod-down` | Stop production environment |
| `make down` | Stop all containers |
| `make clean` | Remove all containers, images, and volumes |
| `make build` | Build Docker image |

## 🗄️ Database Commands

| Command | Description |
|---------|-------------|
| `make db-init` | Initialize database schema and seed data |
| `make db-reset` | Reset database (WARNING: deletes all data) |
| `make db-backup` | Create database backup |
| `make db-restore` | Restore database from backup file |

### Database Restore Example
```bash
make db-restore BACKUP_FILE=backup_20231201_120000.sql
```

## 🧪 Testing & Quality

| Command | Description |
|---------|-------------|
| `make test` | Run tests |
| `make lint` | Run ESLint |
| `make format` | Format code with Prettier |

## 📊 Monitoring & Status

| Command | Description |
|---------|-------------|
| `make logs` | Show logs from all containers |
| `make status` | Show status of all containers |
| `make health` | Check health of all services |

## 🚀 Deployment

| Command | Description |
|---------|-------------|
| `make deploy` | Deploy to Vercel (production) |
| `make deploy-dev` | Deploy to Vercel (development) |

## 🐚 Utility Commands

| Command | Description |
|---------|-------------|
| `make shell` | Open shell in application container |
| `make db-shell` | Open PostgreSQL shell |
| `make redis-cli` | Open Redis CLI |

## ⚡ Quick Aliases

| Command | Alias For |
|---------|-----------|
| `make start` | `make dev` |
| `make stop` | `make down` |
| `make restart` | `make down dev` |
| `make restart-prod` | `make prod-down prod` |

## 🪟 Windows Compatibility

| Command | Description |
|---------|-------------|
| `make win-dev` | Windows-compatible development start |
| `make win-prod` | Windows-compatible production start |

## 📋 Common Workflows

### Development Workflow
```bash
# Start development
make install
make dev

# Check status
make health
make status

# View logs
make logs

# Stop when done
make down
```

### Production Workflow
```bash
# Start production
make prod

# Monitor
make health
make logs

# Deploy to Vercel
make deploy
```

### Database Management
```bash
# Initialize database
make db-init

# Create backup
make db-backup

# Restore from backup
make db-restore BACKUP_FILE=backup_20231201_120000.sql

# Reset database (careful!)
make db-reset
```

### Troubleshooting
```bash
# Check service health
make health

# View container logs
make logs

# Access container shell
make shell

# Restart environment
make restart
```

## 🔧 Environment Setup

The Makefile automatically:
- Checks for `.env` file and creates from template if missing
- Waits for services to be ready
- Performs health checks
- Shows helpful status messages

## 📝 Notes

- All commands use Docker Compose for container management
- Health checks verify PostgreSQL, Redis, and application status
- Database commands require containers to be running
- Windows users can use `make.bat` instead of `make`
- Use `make help` to see all available commands
