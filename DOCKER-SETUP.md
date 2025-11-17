# Docker Setup Guide - IELTS Prep Platform

This guide shows you how to run the entire IELTS Prep Platform using Docker.

## 🚀 Quick Start with Docker

### Step 1: Create Environment File

```bash
cd /home/user/ielts-prep
cp .env.example .env
```

### Step 2: Configure Required Environment Variables

Edit `.env` and set these **REQUIRED** variables:

```bash
# JWT Secrets - MUST SET THESE!
JWT_SECRET=<generate-using-command-below>
JWT_REFRESH_SECRET=<generate-using-command-below>

# Generate secrets with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Services

```bash
# Start PostgreSQL and Redis only (for development)
docker-compose up -d postgres redis

# OR start everything including API (production-like)
docker-compose -f docker-compose.prod.yml up -d
```

### Step 4: Run Database Migrations

```bash
# If running API locally:
cd apps/api
pnpm install
pnpm run db:migrate

# If running API in Docker:
docker exec -it ielts-prep-api sh
cd /app/apps/api
pnpm run db:migrate
exit
```

### Step 5: Access the Application

- **API**: http://localhost:3000 (via Nginx) or http://localhost:3001 (direct)
- **API Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

---

## 📋 Environment Variables Reference

### ✅ REQUIRED Variables (Minimum to Run)

These are **absolutely required** for the application to work:

```bash
# Application
NODE_ENV=development
PORT=3001

# Database (Docker will use these)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ielts_prep

# Redis (Docker will use these)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT - CRITICAL: Generate strong secrets!
JWT_SECRET=REPLACE_WITH_GENERATED_SECRET
JWT_REFRESH_SECRET=REPLACE_WITH_GENERATED_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS - Allow frontend to access API
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# File Upload
UPLOAD_DIR=/app/uploads
```

### 🔧 RECOMMENDED Variables (For Full Functionality)

These enable email sending and other features:

```bash
# AWS Configuration (for SES email service)
AWS_ACCESS_KEY_ID=your-actual-aws-access-key
AWS_SECRET_ACCESS_KEY=your-actual-aws-secret-key
AWS_REGION=us-east-1

# AWS SES Email
SES_FROM_EMAIL=IELTS Prep Platform <noreply@yourdomain.com>
# Note: Verify this email in AWS SES console first!

# Frontend URL (if you have a frontend)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 🎨 OPTIONAL Variables (Nice to Have)

These are completely optional:

```bash
# AWS S3 (for storing audio files in cloud instead of local)
AWS_S3_BUCKET_AUDIO=your-bucket-name
AWS_S3_BUCKET_LISTENING=your-bucket-name

# Cloudinary (alternative for image storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for Whisper transcription)
OPENAI_API_KEY=sk-...

# Monitoring
SENTRY_DSN=https://...
POSTHOG_API_KEY=phc_...
```

---

## 📝 Complete .env Example for Docker

Here's a complete `.env` file you can copy and modify:

```bash
# ===========================================
# IELTS Prep Platform - Docker Configuration
# ===========================================

# Application
NODE_ENV=development
PORT=3001

# Database (matches docker-compose.yml)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=ielts_prep

# Redis (matches docker-compose.yml)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets - GENERATE THESE!
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=abc123generateyourown456def
JWT_REFRESH_SECRET=xyz789generateyourown012ghi
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# File Upload
UPLOAD_DIR=/app/uploads

# Frontend URLs (optional)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# AWS Configuration (optional - for emails)
# Get these from AWS IAM Console
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# AWS SES (optional - for sending emails)
SES_FROM_EMAIL=IELTS Prep Platform <noreply@yourdomain.com>

# AWS S3 (optional)
AWS_S3_BUCKET_AUDIO=
AWS_S3_BUCKET_LISTENING=

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI (optional)
OPENAI_API_KEY=

# Monitoring (optional)
SENTRY_DSN=
POSTHOG_API_KEY=
```

---

## 🎯 Different Docker Scenarios

### Scenario 1: Development (Database + Redis Only)

Use this when you want to run API locally but use Docker for database/Redis:

```bash
# .env configuration
DATABASE_HOST=localhost  # ← Use localhost
REDIS_HOST=localhost     # ← Use localhost

# Start only database and Redis
docker-compose up -d postgres redis

# Run API locally
cd apps/api
pnpm install
pnpm run db:migrate
pnpm run dev
```

**Required variables:**
- JWT_SECRET
- JWT_REFRESH_SECRET
- DATABASE_* variables
- REDIS_* variables

### Scenario 2: Full Docker (Everything in Containers)

Use this for production-like environment:

```bash
# .env configuration
DATABASE_HOST=postgres  # ← Use service name
REDIS_HOST=redis        # ← Use service name

# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Run migrations inside container
docker exec -it ielts-prep-api sh
pnpm run db:migrate
exit
```

**Required variables:**
- JWT_SECRET
- JWT_REFRESH_SECRET
- DATABASE_* variables (with host=postgres)
- REDIS_* variables (with host=redis)

### Scenario 3: Production Deployment

```bash
# .env configuration
NODE_ENV=production
DATABASE_HOST=postgres
REDIS_HOST=redis
# ... plus all AWS credentials

# Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec -it ielts-prep-api pnpm run db:migrate
```

**Required variables:** All from Scenario 2 plus:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- SES_FROM_EMAIL

---

## 🔧 Docker Commands Reference

### Starting Services

```bash
# Start database + Redis only
docker-compose up -d postgres redis

# Start everything (production)
docker-compose -f docker-compose.prod.yml up -d

# Start with logs visible
docker-compose up

# Rebuild and start
docker-compose up -d --build
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 api
```

### Checking Status

```bash
# List running containers
docker-compose ps

# Check health
curl http://localhost:3000/health
```

### Accessing Containers

```bash
# Access API container
docker exec -it ielts-prep-api sh

# Access database
docker exec -it ielts-prep-postgres psql -U postgres -d ielts_prep

# Access Redis
docker exec -it ielts-prep-redis redis-cli
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes all data!)
docker-compose down -v

# Stop specific service
docker-compose stop api
```

### Database Management

```bash
# Backup database
docker exec ielts-prep-postgres pg_dump -U postgres ielts_prep > backup.sql

# Restore database
cat backup.sql | docker exec -i ielts-prep-postgres psql -U postgres -d ielts_prep

# Reset database (WARNING: Deletes all data!)
docker-compose down -v
docker-compose up -d postgres redis
docker exec -it ielts-prep-api pnpm run db:migrate
```

---

## 🐛 Troubleshooting Docker

### Issue 1: "Port already in use"

```bash
# Find what's using the port
lsof -i :3000
lsof -i :5432

# Solution: Stop the conflicting service or change port in .env
PORT=3002
```

### Issue 2: "Cannot connect to database"

```bash
# Check if postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# If DATABASE_HOST is wrong:
# - Use 'localhost' if API runs locally
# - Use 'postgres' if API runs in Docker
```

### Issue 3: "Migration failed"

```bash
# Make sure database is ready
docker-compose ps

# Wait for postgres to be healthy
sleep 10

# Try migration again
docker exec -it ielts-prep-api pnpm run db:migrate
```

### Issue 4: "Email sending failed"

```bash
# Check if AWS credentials are set
docker exec -it ielts-prep-api env | grep AWS

# Verify SES_FROM_EMAIL is verified in AWS SES
# Make sure you're not in SES sandbox mode
```

### Issue 5: Container keeps restarting

```bash
# Check container logs
docker-compose logs api

# Common causes:
# - Missing JWT_SECRET
# - Database not ready
# - Invalid environment variables

# Fix: Update .env and restart
docker-compose restart api
```

### Issue 6: "No space left on device"

```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Remove old images
docker image prune -a
```

---

## 📊 Environment Variable Priority

Docker Compose reads environment variables in this order:

1. **docker-compose.yml** `environment:` section
2. **.env** file in project root
3. **System environment variables**

For this project:
- Put ALL variables in `.env` file
- Docker Compose will automatically load them
- No need to export them in your shell

---

## ✅ Verification Checklist

Before running, verify:

- [ ] `.env` file exists and has all required variables
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are set (not default values)
- [ ] `DATABASE_HOST=postgres` (for full Docker) or `localhost` (for local API)
- [ ] `REDIS_HOST=redis` (for full Docker) or `localhost` (for local API)
- [ ] Docker is running (`docker ps` works)
- [ ] Ports 3000, 3001, 5432, 6379 are free

Run verification:

```bash
# Check .env file
cat .env | grep -E "JWT_SECRET|DATABASE_HOST|REDIS_HOST"

# Start services
docker-compose up -d postgres redis

# Wait a bit
sleep 10

# Check health
curl http://localhost:3001/health
```

---

## 🎓 Next Steps

1. ✅ Configure `.env` with required variables
2. ✅ Start Docker services
3. ✅ Run database migrations
4. ✅ Access API documentation: http://localhost:3001/api/docs
5. ✅ Create your first user via API
6. ✅ Test email sending (if AWS SES configured)

---

## 📚 Additional Resources

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **PostgreSQL Image**: https://hub.docker.com/_/postgres
- **Redis Image**: https://hub.docker.com/_/redis
- **NestJS Deployment**: https://docs.nestjs.com/faq/deployment

---

**Ready to start? Run:**

```bash
cd /home/user/ielts-prep
cp .env.example .env
# Edit .env and set JWT_SECRET, JWT_REFRESH_SECRET
docker-compose up -d postgres redis
cd apps/api && pnpm install && pnpm run db:migrate && pnpm run dev
```

🎉 **You're all set!**
