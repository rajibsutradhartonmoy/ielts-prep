# Build stage
FROM node:20-alpine AS builder

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

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Copy entrypoint script
COPY apps/api/docker-entrypoint.sh /app/apps/api/

# Set working directory
WORKDIR /app/apps/api

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
