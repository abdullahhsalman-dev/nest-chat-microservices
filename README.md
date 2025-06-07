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

Purpose of API Gateway in a Microservices Architecture

Single Entry Point - Provides a unified interface for clients to interact with multiple microservices
Request Routing - Directs incoming requests to the appropriate microservice based on the route
Authentication & Authorization - Centralizes security concerns by validating user identity before requests reach microservices
Protocol Translation - Converts external HTTP/REST requests into internal microservice communication protocols (TCP, gRPC, etc.)
Load Balancing - Distributes incoming requests across multiple instances of the same microservice
Response Aggregation - Combines responses from multiple microservices into a single response for the client
Rate Limiting - Controls the number of requests clients can make to protect backend services
Caching - Stores frequently accessed data to reduce load on microservices
Request/Response Transformation - Modifies requests and responses to ensure compatibility between clients and services
API Documentation - Hosts Swagger/OpenAPI documentation for the entire system
Circuit Breaking - Detects failing microservices and prevents cascading failures throughout the system
Logging & Monitoring - Provides a centralized place to track all incoming requests for observability
Cross-Cutting Concerns - Handles common functionalities like CORS, compression, and request validation
Versioning - Manages multiple API versions and routes to appropriate service implementations
Simplifies Client Development - Clients need to know only one endpoint instead of multiple microservice locations
RetryClaude can make mistakes. Please double-check responses.

Why Two Auth Folders Exist in Different Locations
Having two separate auth folders (one in apps/api-gateway/src/auth and another in apps/auth-service) serves different purposes in a microservices architecture:
api-gateway/src/auth/ folder

Client-Facing Authentication Layer - Handles HTTP requests for login/register from clients
Token Validation - Verifies JWT tokens in incoming requests using guards and strategies
Gateway-Specific Logic - Contains code specific to the API Gateway's responsibilities
Request Translation - Converts REST API requests into microservice messages
Authentication Routing - Forwards authentication requests to the auth-service
HTTP Security - Manages HTTP-specific security concerns like CORS, headers, etc.
API Documentation - Contains Swagger annotations for authentication endpoints

apps/auth-service/ folder

Authentication Business Logic - Contains the core implementation of authentication features
Database Interactions - Manages user credentials in the database
Password Hashing - Handles secure storage of passwords
Token Generation - Creates and signs JWT tokens
User Management - Contains user creation, verification, and profile management
Microservice Implementation - Exposes functionality through microservice transport (TCP)
Independent Deployment - Can be deployed and scaled separately from the API Gateway

This separation follows the microservices pattern where:

API Gateway handles client communication, routing, and protocol translation
Auth Service contains the actual business logic and data access

This design provides several advantages:

Separation of Concerns - Each component has clear, distinct responsibilities
Independent Scaling - The auth service can be scaled based on authentication load
Technology Flexibility - The auth service could be implemented in a different language/framework if needed
Focused Development - Teams can work on specific services without affecting others
Isolation - Issues in one component don't directly impact others

The API Gateway's auth folder primarily acts as a client-facing façade that delegates to the actual auth-service for processing.RetryClaude can make mistakes. Please double-check responses. 3.7 Sonnet

- Run the startup script:
- bash./startup.sh

docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

docker-compose logs --tail=100 api-gateway
