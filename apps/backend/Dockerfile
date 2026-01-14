# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY apps/backend ./apps/backend

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

# Build backend
RUN pnpm build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Install OpenSSL and other runtime dependencies
RUN apk add --no-cache openssl dumb-init

# Copy package files
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# Copy packages
COPY --from=builder /app/packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Copy node_modules from builder (includes Prisma Client)
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Set working directory to backend
WORKDIR /app/apps/backend

# Generate Prisma Client again in production image
RUN pnpm prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main"]
