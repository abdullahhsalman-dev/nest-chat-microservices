# apps/presence-service/Dockerfile
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
RUN npm run build presence-service

# Expose the service port
EXPOSE 3002

# Start the service
CMD ["node", "dist/apps/presence-service/main"]