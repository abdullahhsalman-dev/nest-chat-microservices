nest-chat-microservices/
├── apps/
│ ├── api-gateway/ # Main entry point for client requests
│ ├── auth-service/ # Authentication service
│ ├── chat-service/ # Chat handling and persistence
│ ├── presence-service/ # Online/offline user tracking
│ └── notification-service/ # Push notifications
├── libs/
│ └── common/ # Shared code between services
├── docker-compose.yml
└── package.json

# Install NestJS CLI globally

npm i -g @nestjs/cli

# Create a monorepo workspace

nest new nest-chat-microservices
cd nest-chat-microservices

# Create application services

nest generate app api-gateway
nest generate app auth-service
nest generate app chat-service
nest generate app presence-service
nest generate app notification-service

# Create shared library

nest generate library common

# Install dependencies

npm i @nestjs/microservices @nestjs/websockets @nestjs/platform-socket.io socket.io redis ioredis mongodb mongoose @nestjs/mongoose passport passport-jwt @nestjs/passport @nestjs/jwt bcrypt class-validator class-transformer

# Install dev dependencies

npm i -D @types/passport-jwt @types/bcrypt

# To start all services with Docker Compose

docker-compose up -d

# To see logs of all services

docker-compose logs -f

# To see logs of a specific service

docker-compose logs -f api-gateway

# To stop all services

docker-compose down

# Alternative: Running services without Docker for development

# In separate terminal windows:

# Terminal 1: Start MongoDB and Redis

docker-compose up -d mongodb redis

# Terminal 2: Start the Auth Service

cd nest-chat-microservices
npm run start:dev auth-service

# Terminal 3: Start the Chat Service

cd nest-chat-microservices
npm run start:dev chat-service

# Terminal 4: Start the Presence Service

cd nest-chat-microservices
npm run start:dev presence-service

# Terminal 5: Start the Notification Service

cd nest-chat-microservices
npm run start:dev notification-service

# Terminal 6: Start the API Gateway

cd nest-chat-microservices
npm run start:dev api-gateway# To start all services with Docker Compose
docker-compose up -d

# To see logs of all services

docker-compose logs -f

# To see logs of a specific service

docker-compose logs -f api-gateway

# To stop all services

docker-compose down

# Alternative: Running services without Docker for development

# In separate terminal windows:

# Terminal 1: Start MongoDB and Redis

docker-compose up -d mongodb redis

# Terminal 2: Start the Auth Service

cd nest-chat-microservices
npm run start:dev auth-service

# Terminal 3: Start the Chat Service

cd nest-chat-microservices
npm run start:dev chat-service

# Terminal 4: Start the Presence Service

cd nest-chat-microservices
npm run start:dev presence-service

# Terminal 5: Start the Notification Service

cd nest-chat-microservices
npm run start:dev notification-service

# Terminal 6: Start the API Gateway

cd nest-chat-microservices
npm run start:dev api-gateway

# After starting all services, you can test the API using curl or Postman

# Register a new user

curl -X POST http://localhost:3000/auth/register \
 -H "Content-Type: application/json" \
 -d '{"username": "testuser1", "email": "test1@example.com", "password": "password123"}'

# Login to get JWT token

curl -X POST http://localhost:3000/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "test1@example.com", "password": "password123"}'

# Save the JWT token from the response and use it in subsequent requests

# (Replace YOUR_JWT_TOKEN with the actual token)

# Get online users

curl -X GET http://localhost:3000/presence/users/online \
 -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user status

curl -X GET http://localhost:3000/presence/users/USER_ID/status \
 -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send a message

curl -X POST http://localhost:3000/chat/messages \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 -d '{"content": "Hello, this is a test message", "receiverId": "RECEIVER_USER_ID"}'

# Get conversation history

curl -X GET http://localhost:3000/chat/conversations/RECEIVER_USER_ID \
 -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get recent conversations

curl -X GET http://localhost:3000/chat/conversations \
 -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark message as read

curl -X POST http://localhost:3000/chat/messages/MESSAGE_ID/read \
 -H "Authorization: Bearer YOUR_JWT_TOKEN"

API Gateway: Acts as the entry point for all client requests, routing them to the appropriate microservices
Authentication Service: Handles user registration, login, and token validation
Chat Service: Manages message persistence and retrieval
Presence Service: Tracks user online/offline status using Redis
Notification Service: Delivers real-time notifications using WebSockets

Key Architecture Points

Service Communication: The services communicate primarily using the TCP transport mechanism provided by NestJS's microservices system
Event-Based Communication: For notifications and status updates, we use an event-based approach
Data Storage: MongoDB for persistent data (users, messages) and Redis for ephemeral data (presence)
Real-time Updates: Socket.IO for delivering notifications to connected clients
API Security: JWT-based authentication with authorization guards
