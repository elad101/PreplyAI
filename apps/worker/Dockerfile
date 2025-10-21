# Multi-stage build for PreplyAI Worker
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy prompts directory (needed for prompt loading)
COPY --from=builder --chown=nodejs:nodejs /app/../../prompts ./../../prompts

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production

# Start the worker
CMD ["node", "dist/index.js"]

