# IELTS Prep Platform - Deployment Guide

This guide covers deployment options for the IELTS Prep Platform in production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Health Checks](#health-checks)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20+ (for manual deployment)
- Docker & Docker Compose (for Docker deployment)
- PostgreSQL 16+
- Redis 7+
- Domain name with SSL certificate (for production)

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=ielts_prep

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# JWT (Generate strong secrets!)
JWT_SECRET=<generate-strong-secret-key>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AWS SES (Email Service)
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=us-east-1
SES_FROM_EMAIL=IELTS Prep Platform <noreply@yourdomain.com>
# Note: Verify sender email in AWS SES console

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Generating Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ielts_prep;

# Create user (if needed)
CREATE USER ielts_prep_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE ielts_prep TO ielts_prep_user;

# Exit
\q
```

### 2. Run Migrations

```bash
cd apps/api

# Generate migration files from schema
pnpm run db:generate

# Run migrations
pnpm run db:migrate
```

## Docker Deployment

### Production Deployment with Docker Compose

1. **Prepare environment file**

```bash
cp .env.example .env
# Edit .env with production values
```

2. **Build and start services**

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

3. **Run database migrations**

```bash
# Connect to API container
docker exec -it ielts-prep-api sh

# Run migrations
pnpm run db:migrate

# Exit container
exit
```

### Services Overview

The Docker setup includes:

- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 cache and queue
- **api**: NestJS API server
- **nginx**: Reverse proxy and load balancer

### Port Mappings

- `80`: HTTP (Nginx)
- `443`: HTTPS (Nginx)
- `3000`: API (direct access)
- `5432`: PostgreSQL (for external access)
- `6379`: Redis (for external access)

## Manual Deployment

### 1. Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install --frozen-lockfile
```

### 2. Build Application

```bash
# Build API
cd apps/api
pnpm run build

# Build Web (if applicable)
cd ../web
pnpm run build
```

### 3. Run Database Migrations

```bash
cd apps/api
pnpm run db:migrate
```

### 4. Start Application

```bash
# Production mode
pnpm run start:prod

# Or use PM2 for process management
pm2 start dist/main.js --name ielts-prep-api
pm2 save
pm2 startup
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ielts-prep-api',
    script: 'dist/main.js',
    cwd: './apps/api',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Health Checks

The application provides several health check endpoints:

### Liveness Probe

```bash
curl http://localhost:3000/health/liveness
```

Returns: `200 OK` if the application is running

### Readiness Probe

```bash
curl http://localhost:3000/health/readiness
```

Returns: `200 OK` if the application is ready to handle requests (database and Redis are connected)

### Full Health Check

```bash
curl http://localhost:3000/health
```

Returns detailed health information about:
- Database connectivity
- Redis connectivity
- Memory usage
- Disk storage

### Individual Component Checks

```bash
# Database only
curl http://localhost:3000/health/database

# Redis only
curl http://localhost:3000/health/redis

# Memory only
curl http://localhost:3000/health/memory
```

## Monitoring

### Application Logs

```bash
# Docker logs
docker-compose logs -f api

# PM2 logs
pm2 logs ielts-prep-api

# Direct logs
tail -f apps/api/logs/out.log
```

### Background Jobs

Monitor Bull queues:

```bash
# Install Bull Board (optional)
pnpm add @bull-board/express

# Access Bull Board at: http://localhost:3000/admin/queues
```

### Database Monitoring

```bash
# Connect to database
psql -h localhost -U postgres -d ielts_prep

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'ielts_prep';

# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### Redis Monitoring

```bash
# Connect to Redis
redis-cli -h localhost -p 6379

# Check queue status
INFO
DBSIZE
```

## API Documentation

Access Swagger API documentation at:

```
http://localhost:3000/api/docs
```

Features:
- Interactive API testing
- Request/response schemas
- Authentication testing
- Complete endpoint documentation

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

1. **Install Certbot**

```bash
apt-get update
apt-get install certbot python3-certbot-nginx
```

2. **Obtain SSL Certificate**

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal**

```bash
# Test renewal
certbot renew --dry-run

# Setup cron job
crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Backup Strategy

### Database Backups

```bash
# Create backup
pg_dump -h localhost -U postgres ielts_prep > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h localhost -U postgres ielts_prep < backup_20231215_120000.sql

# Automated daily backups
cat > /etc/cron.daily/backup-ielts-prep << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/ielts-prep"
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U postgres ielts_prep | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d).sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF
chmod +x /etc/cron.daily/backup-ielts-prep
```

### File Uploads Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /app/uploads

# Restore
tar -xzf uploads_backup_20231215.tar.gz -C /
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d ielts_prep

# Check logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

#### 2. Redis Connection Issues

```bash
# Check if Redis is running
systemctl status redis

# Check connection
redis-cli ping

# Check logs
tail -f /var/log/redis/redis-server.log
```

#### 3. Application Not Starting

```bash
# Check logs
docker-compose logs api

# Or PM2 logs
pm2 logs ielts-prep-api

# Check port availability
netstat -tlnp | grep 3000
```

#### 4. Migration Failures

```bash
# Reset migrations (CAUTION: This will drop all data)
psql -U postgres -d ielts_prep -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
pnpm run db:migrate
```

#### 5. Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm run start:prod

# Or in PM2 ecosystem
node_args: "--max-old-space-size=4096"
```

### Performance Optimization

#### 1. Database Indexing

Check missing indexes:

```sql
SELECT schemaname, tablename, attname, n_distinct
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

#### 2. Redis Memory

```bash
# Check memory usage
redis-cli INFO memory

# Set max memory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

#### 3. Node.js Performance

```bash
# Enable cluster mode
NODE_ENV=production node --optimize-for-size --max-old-space-size=4096 dist/main.js
```

## Security Checklist

- [ ] Use strong passwords for database and Redis
- [ ] Generate secure JWT secrets
- [ ] Enable SSL/HTTPS in production
- [ ] Configure firewall to restrict database/Redis access
- [ ] Enable CORS with specific origins
- [ ] Set up rate limiting (already configured via Throttler)
- [ ] Regular security updates
- [ ] Enable database SSL connections
- [ ] Use environment variables for secrets (never commit)
- [ ] Regular backups
- [ ] Monitor application logs
- [ ] Implement audit logging (already included)

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple API Instances**: Run multiple Docker containers or PM2 cluster mode
3. **Database**: Use read replicas for read-heavy workloads
4. **Redis**: Use Redis Cluster for high availability

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use caching extensively
- Implement CDN for static assets

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/ielts-prep/issues
- Email: support@ielts-prep.com
- Documentation: https://docs.ielts-prep.com

## License

MIT License - see LICENSE file for details
