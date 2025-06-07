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
RUN npm run build notification-service

# Production stage
FROM node:20-alpine AS production

# Install only wget for health check
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/dist/apps/notification-service ./dist/apps/notification-service
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Expose the service ports
EXPOSE 3004
EXPOSE 3005

# Start the service
CMD ["node", "dist/apps/notification-service/main"]