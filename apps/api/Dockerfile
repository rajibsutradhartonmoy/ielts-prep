# Build stage
FROM node:20-alpine AS builder

# Update package index and install build dependencies for native modules
RUN apk update && apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types

# Build the application
WORKDIR /app/apps/api
RUN pnpm run build

# Verify build output exists
RUN ls -la dist/ && find dist -name "main.js" && echo "✅ Build successful!"

# Production stage
FROM node:20-alpine AS production

# Update package index and install build dependencies for native modules (bcrypt) and utilities
RUN apk update && apk add --no-cache python3 make g++ curl

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/

# Install dependencies (including tsx for migrations)
RUN pnpm install --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/api/src/database ./apps/api/src/database
COPY --from=builder /app/apps/api/drizzle.config.ts ./apps/api/
COPY --from=builder /app/apps/api/tsconfig.json ./apps/api/
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Copy entrypoint script
COPY apps/api/docker-entrypoint.sh /app/apps/api/

# Set working directory
WORKDIR /app/apps/api

# Verify all required files exist
RUN ls -la dist/ && \
    find dist -name "main.js" && \
    ls -la drizzle/ && \
    ls -la src/database/ && \
    echo "✅ All files copied successfully!"

# Install postgresql-client and netcat for health checks
USER root
RUN apk add --no-cache postgresql-client netcat-openbsd

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health/liveness || exit 1

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/main.js"]
