# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with clean install
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build presence-service

# Production stage
FROM node:20-alpine AS production

# Install only wget for health check
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/dist/apps/presence-service ./dist/apps/presence-service
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Expose the service port
EXPOSE 3002

# Start the service
CMD ["node", "dist/apps/presence-service/main"]