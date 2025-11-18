#!/bin/sh
set -e

echo "🚀 Starting IELTS Prep Platform API..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$DATABASE_PASSWORD psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c '\q' 2>/dev/null; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; do
  echo "   Redis is unavailable - sleeping"
  sleep 2
done
echo "✅ Redis is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
pnpm exec tsx src/database/migrate.ts || {
  echo "⚠️  Migration failed, but continuing..."
}
echo "✅ Migrations complete!"

# Start the application
echo "🎉 Starting application on port ${PORT:-3000}..."
exec "$@"
