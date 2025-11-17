# 🚀 Quick Start - One Command Setup

Run the entire IELTS Prep Platform with just **ONE command**!

## ⚡ Fast Setup (2 Minutes)

### Step 1: Copy Environment File

```bash
cp .env.example .env
```

### Step 2: Generate JWT Secrets

Open `.env` and replace the JWT secrets with newly generated ones:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy these values and paste them into your `.env` file:
```bash
JWT_SECRET=<paste-first-generated-secret-here>
JWT_REFRESH_SECRET=<paste-second-generated-secret-here>
```

### Step 3: Start Everything! 🎉

```bash
docker-compose up -d
```

That's it! The command will:
- ✅ Start PostgreSQL database
- ✅ Start Redis cache
- ✅ Build the API
- ✅ Run database migrations automatically
- ✅ Start the application

### Step 4: Verify It's Running

Wait about 60 seconds for everything to start, then check:

```bash
# Check all services are running
docker-compose ps

# Check API health
curl http://localhost:8081/health
```

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

### Step 5: Access the Application

- **Frontend**: http://localhost:8080
- **API**: http://localhost:8081
- **API Documentation**: http://localhost:8081/api/docs
- **Health Check**: http://localhost:8081/health

---

## 📋 Minimum Required Environment Variables

The **ONLY** variables you MUST set in `.env` before running:

```bash
JWT_SECRET=<generate-using-node-command-above>
JWT_REFRESH_SECRET=<generate-using-node-command-above>
```

Everything else has defaults and will work out of the box!

---

## 🎯 Optional: Enable Email Sending

If you want to send emails, add AWS SES credentials to `.env`:

```bash
AWS_ACCESS_KEY_ID=your-actual-aws-access-key
AWS_SECRET_ACCESS_KEY=your-actual-aws-secret-key
AWS_REGION=us-east-1
SES_FROM_EMAIL=IELTS Prep Platform <noreply@yourdomain.com>
```

**Note**: Make sure to verify your email in AWS SES console first!

---

## 🔧 Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Just API
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Stop Everything

```bash
docker-compose down
```

### Restart API

```bash
docker-compose restart api
```

### Reset Everything (WARNING: Deletes all data!)

```bash
docker-compose down -v
docker-compose up -d
```

### Access Database

```bash
docker exec -it ielts-prep-postgres psql -U postgres -d ielts_prep
```

### Access Redis

```bash
docker exec -it ielts-prep-redis redis-cli
```

---

## 🐛 Troubleshooting

### "Port already in use"

Change the port in `.env`:
```bash
PORT=3002
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### "Container keeps restarting"

Check the logs:
```bash
docker-compose logs api
```

Common issues:
- JWT_SECRET not set in `.env`
- Database not ready (wait 60 seconds)

### "Migration failed"

Restart the API:
```bash
docker-compose restart api
```

### Need to rebuild?

```bash
docker-compose down
docker-compose up -d --build
```

---

## 📚 Next Steps

1. **Create your first user** - Visit http://localhost:8081/api/docs
2. **Test authentication** - Try the login endpoint
3. **Explore all endpoints** - Check out the Swagger documentation
4. **Read full setup guide** - See [SETUP.md](./SETUP.md) for details
5. **Docker details** - See [DOCKER-SETUP.md](./DOCKER-SETUP.md) for advanced config

---

## ✅ Complete Workflow

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Generate and set JWT secrets in .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy to JWT_SECRET in .env

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy to JWT_REFRESH_SECRET in .env

# 3. Start everything
docker-compose up -d

# 4. Wait a minute...
sleep 60

# 5. Check health
curl http://localhost:8081/health

# 6. Open browser
# Visit: http://localhost:8080 (Frontend)
# Visit: http://localhost:8081/api/docs (API Docs)
```

**That's it! You're ready to go! 🎉**

---

## 💡 Default Configuration

The following defaults are used if not specified in `.env`:

- **Database**: postgres:postgres@localhost:54320/ielts_prep
- **Redis**: localhost:63790 (no password)
- **Frontend Port**: 8080
- **API Port**: 8081
- **Node Environment**: development
- **JWT Expiration**: 15 minutes (access), 7 days (refresh)
- **CORS**: Allow all origins in development

These work perfectly for local development!

---

For more detailed setup instructions, see:
- [SETUP.md](./SETUP.md) - Complete setup guide
- [DOCKER-SETUP.md](./DOCKER-SETUP.md) - Docker configuration details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
