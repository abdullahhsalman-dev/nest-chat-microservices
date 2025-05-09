# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the auth-service
RUN npm run build auth-service

# Set the command to run your application
CMD ["node", "dist/apps/auth-service/main"]
