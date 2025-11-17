# IELTS Prep Platform - Setup Guide

This guide will help you set up and run the IELTS Prep Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Package manager
- **PostgreSQL 16+** - Database
- **Redis 7+** - Cache and job queue
- **Git** - Version control
- **Docker & Docker Compose** (Optional - for easier setup)

### Check Your Installation

```bash
# Check Node.js version (should be 20+)
node --version

# Check pnpm (install if needed)
pnpm --version

# If pnpm is not installed:
npm install -g pnpm

# Check PostgreSQL
psql --version

# Check Redis
redis-cli --version

# Check Docker (optional)
docker --version
docker-compose --version
```

## 🎯 Quick Start (Recommended - Using Docker)

This is the **easiest way** to get started:

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ielts-prep
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env and update these required variables:
# - JWT_SECRET (generate using the command below)
# - AWS credentials (if you want to test emails)
```

**Generate secure JWT secrets:**

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy these values to your .env file
```

### 3. Start Services with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (30 seconds)
sleep 30

# Check if services are running
docker-compose ps
```

You should see:
```
NAME                  STATUS
ielts-prep-postgres   Up
ielts-prep-redis      Up
```

### 4. Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

This will install dependencies for:
- Root workspace
- API application
- Web application (frontend)
- Shared types package

### 5. Set Up Database

```bash
# Navigate to API directory
cd apps/api

# Generate database migration files
pnpm run db:generate

# Run migrations to create tables
pnpm run db:migrate

# Go back to root
cd ../..
```

### 6. Start the API Server

```bash
cd apps/api
pnpm run dev
```

**Expected output:**
```
[Nest] 12345  - 11/17/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/17/2025, 10:00:00 AM     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 12345  - 11/17/2025, 10:00:01 AM     LOG Application is running on: http://localhost:3001
[Nest] 12345  - 11/17/2025, 10:00:01 AM     LOG Swagger docs available at: http://localhost:3001/api/docs
```

### 7. Verify Installation

Open your browser and visit:

- **API Health Check**: http://localhost:3001/health
- **API Documentation (Swagger)**: http://localhost:3001/api/docs

You should see:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

🎉 **Success!** Your API is now running!

---

## 🔧 Manual Setup (Without Docker)

If you prefer not to use Docker:

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Download from https://github.com/microsoftarchive/redis/releases

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE ielts_prep;
CREATE USER ielts_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ielts_prep TO ielts_user;

# Exit
\q
```

### 4. Update .env File

```bash
# Update database credentials
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ielts_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=ielts_prep

# Update Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 5. Follow Steps 4-7 from Quick Start

---

## 📁 Project Structure

```
ielts-prep/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── database/    # Database & schemas
│   │   │   └── common/      # Shared utilities
│   │   └── package.json
│   └── web/                 # Next.js Frontend (if exists)
├── packages/
│   └── shared-types/        # Shared TypeScript types
├── docker-compose.yml       # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
├── .env.example            # Environment variables template
└── README.md
```

---

## 🧪 Testing the Application

### 1. Access API Documentation

Visit http://localhost:3001/api/docs

This is the **Swagger UI** where you can:
- See all available API endpoints
- Test endpoints interactively
- View request/response schemas

### 2. Create a System Admin (First User)

```bash
# Using curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "System Admin"
  }'
```

Or use Swagger UI:
1. Go to http://localhost:3001/api/docs
2. Find `POST /api/auth/register`
3. Click "Try it out"
4. Fill in the details
5. Click "Execute"

### 3. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

You'll receive a JWT token:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "System Admin"
  }
}
```

### 4. Use the Token

In Swagger UI:
1. Click the green **"Authorize"** button at the top
2. Enter: `Bearer <your-access-token>`
3. Click "Authorize"
4. Now you can test protected endpoints!

---

## 🔑 Environment Variables Explained

### Required Variables

```bash
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ielts_prep

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT - MUST CHANGE IN PRODUCTION
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Optional Variables (for full functionality)

```bash
# AWS SES (for sending emails)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
SES_FROM_EMAIL=IELTS Prep <noreply@yourdomain.com>

# File Upload
UPLOAD_DIR=./uploads

# CORS (frontend URLs)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to database"

**Check if PostgreSQL is running:**
```bash
# Docker
docker-compose ps postgres

# Local
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

**Test connection:**
```bash
psql -h localhost -U postgres -d ielts_prep
```

**Solution:**
```bash
# Docker
docker-compose restart postgres

# Local
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux
```

### Issue 2: "Cannot connect to Redis"

**Check if Redis is running:**
```bash
# Docker
docker-compose ps redis

# Local
redis-cli ping
```

**Solution:**
```bash
# Docker
docker-compose restart redis

# Local
brew services restart redis        # macOS
sudo systemctl restart redis      # Linux
```

### Issue 3: "Port 3001 already in use"

**Find what's using the port:**
```bash
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001
```

**Solution:**
```bash
# Kill the process or change port in .env
PORT=3002
```

### Issue 4: "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue 5: Migration errors

**Solution:**
```bash
cd apps/api

# Reset database (WARNING: This deletes all data)
psql -U postgres -c "DROP DATABASE ielts_prep;"
psql -U postgres -c "CREATE DATABASE ielts_prep;"

# Run migrations again
pnpm run db:generate
pnpm run db:migrate
```

### Issue 6: TypeScript errors

**Solution:**
```bash
cd apps/api

# Check for type errors
pnpm run type-check

# If there are errors, try:
pnpm install
pnpm run build
```

---

## 📊 Available Scripts

### API Development

```bash
cd apps/api

pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run start:prod    # Start production server
pnpm run lint          # Lint code
pnpm run type-check    # Check TypeScript types
pnpm run test          # Run tests
```

### Database Management

```bash
cd apps/api

pnpm run db:generate   # Generate migration files
pnpm run db:migrate    # Run migrations
pnpm run db:push       # Push schema to database
pnpm run db:studio     # Open Drizzle Studio (DB GUI)
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Restart a service
docker-compose restart postgres

# Remove all data (WARNING: Deletes everything)
docker-compose down -v
```

---

## 🎯 Next Steps

1. ✅ **Explore API Documentation**
   - Visit http://localhost:3001/api/docs
   - Try creating organizations, users, tests

2. ✅ **Set Up AWS SES** (for emails)
   - Follow the AWS SES setup guide
   - Test email sending

3. ✅ **Create Sample Data**
   - Create an organization
   - Add teachers and students
   - Create IELTS tests
   - Assign tests to students

4. ✅ **Configure Frontend** (if applicable)
   - Set up Next.js frontend
   - Connect to API

5. ✅ **Deploy to Production**
   - Follow DEPLOYMENT.md guide
   - Set up production database
   - Configure domain and SSL

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs:**
   ```bash
   # API logs
   docker-compose logs -f api

   # Database logs
   docker-compose logs -f postgres
   ```

2. **Check health endpoints:**
   - http://localhost:3001/health
   - http://localhost:3001/health/database
   - http://localhost:3001/health/redis

3. **Review documentation:**
   - README.md
   - DEPLOYMENT.md
   - API docs: http://localhost:3001/api/docs

4. **Common issues:**
   - Database connection: Check DATABASE_* env vars
   - Redis connection: Check REDIS_* env vars
   - JWT errors: Check JWT_SECRET is set
   - Email errors: Check AWS SES credentials

---

## 📚 Additional Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Drizzle ORM**: https://orm.drizzle.team
- **PostgreSQL**: https://www.postgresql.org/docs
- **Redis**: https://redis.io/docs
- **AWS SES**: https://docs.aws.amazon.com/ses

---

**Happy coding! 🚀**
