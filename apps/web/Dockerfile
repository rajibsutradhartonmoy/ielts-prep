# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared-types ./packages/shared-types

# Build the application
WORKDIR /app/apps/web

# Ensure public directory exists
RUN mkdir -p public

RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install pnpm and curl
RUN npm install -g pnpm && \
    apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Set working directory
WORKDIR /app/apps/web

# Switch to non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]
