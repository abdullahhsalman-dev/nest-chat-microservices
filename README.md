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