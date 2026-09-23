# Multi-stage build for smaller image
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Production image
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
