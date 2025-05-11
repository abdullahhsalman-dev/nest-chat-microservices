# apps/notification-service/Dockerfile
FROM node:20-alpine

# Install wget for health check
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build notification-service

# Expose the service ports
EXPOSE 3004
EXPOSE 3005

# Start the service
CMD ["node", "dist/apps/notification-service/main"]