# Use a multi-stage build approach
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy only package files first to leverage Docker cache for dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source files and build
COPY . .
RUN npm run build api-gateway

# Create a smaller production image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main"]