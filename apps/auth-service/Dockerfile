# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with clean install and only production dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build auth-service

# Production stage
FROM node:20-alpine AS production

# Install only wget for health check
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/dist/apps/auth-service ./dist/apps/auth-service
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Expose the service port
EXPOSE 3001

# Start the service
CMD ["node", "dist/apps/auth-service/main"]