/**
 * Authentication Module for the Auth Microservice.
 * This module configures the authentication system, including MongoDB integration,
 * JWT handling, microservice clients, and controllers for authentication and health checks.
 */

// Import NestJS module decorator
import { Module } from '@nestjs/common';
// Import MongooseModule for MongoDB integration
import { MongooseModule } from '@nestjs/mongoose';
// Import JwtModule for JWT handling
import { JwtModule } from '@nestjs/jwt';
// Import ClientsModule for microservice communication
import { ClientsModule, Transport } from '@nestjs/microservices';
// Import the AuthController for handling auth-related messages
import { AuthController } from './auth-service.controller';
// Import the AuthService for authentication logic
import { AuthService } from './auth-service.service';
// Import the User schema for MongoDB
import { UserSchema } from './schemas/user.schema';
// Import the HealthController for health check endpoints
import { HealthController } from './health/health.controller';
// Import microservice constants
import { SERVICES } from '../../../libs/common/src/constants/microservices';

// Define the AuthModule with the @Module decorator
@Module({
  // Specify modules to import for dependency injection
  imports: [
    // Configure MongoDB connection using Mongoose
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-auth',
    ),
    // Register the User schema for Mongoose
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    // Configure JwtModule for JWT generation and verification
    JwtModule.register({
      // Set the JWT secret (fallback to 'secretKey' if not set)
      secret: process.env.JWT_SECRET || 'sdfsadfsdafdsfdsf',
      // Set JWT expiration (fallback to 1 hour if not set)
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '1h' },
    }),
    // Configure microservice clients for PRESENCE_SERVICE and NOTIFICATION_SERVICE
    ClientsModule.register([
      {
        // Define the PRESENCE_SERVICE client
        name: SERVICES.PRESENCE_SERVICE,
        // Use TCP transport for communication
        transport: Transport.TCP,
        // Configure host and port for PRESENCE_SERVICE
        options: {
          host: process.env.PRESENCE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PRESENCE_SERVICE_PORT || '3002', 10),
        },
      },
      {
        // Define the NOTIFICATION_SERVICE client
        name: SERVICES.NOTIFICATION_SERVICE,
        // Use TCP transport for communication
        transport: Transport.TCP,
        // Configure host and port for NOTIFICATION_SERVICE
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
        },
      },
    ]),
  ],
  // Register controllers for handling messages and HTTP requests
  controllers: [AuthController, HealthController],
  // Register AuthService as a provider for dependency injection
  providers: [AuthService],
})
// Export the AuthModule class
export class AuthModule {}

// Explanation of ClientsModule.register
// Purpose: ClientsModule.register is a method in NestJS used to configure and register microservice clients within a module,
//  enabling communication with other microservices (e.g., PRESENCE_SERVICE and NOTIFICATION_SERVICE).
//
// What It Does:
// Registers Clients: Defines microservice clients by specifying their name, transport, and connection options
// (e.g., host and port).
// Enables Communication: Allows the auth microservice to send messages to other microservices via the specified
// transport (TCP in this case).
// Dependency Injection: Makes the ClientProxy instances
// (e.g., for PRESENCE_SERVICE and NOTIFICATION_SERVICE) injectable into controllers or services
// using @Inject(SERVICES.PRESENCE_SERVICE) or @Inject(SERVICES.NOTIFICATION_SERVICE).
//
//
// Configuration in Code:
// Two clients are registered:
// PRESENCE_SERVICE: Connects to localhost:3002 (or environment variables) for presence-related functionality
// (e.g., user online/offline status).
// NOTIFICATION_SERVICE: Connects to localhost:3004 (or environment variables) for notification-related functionality.
// Uses Transport.TCP for communication, with host/port fallback values if environment variables
//  (PRESENCE_SERVICE_HOST, NOTIFICATION_SERVICE_PORT, etc.) are not set.
// Usage: The AuthService or other components can use these clients to send commands
// (e.g., via client.send()) to the presence or notification microservices, facilitating inter-service communication.
// Summary
// Comments: Added to clarify imports, MongoDB setup, JWT configuration, microservice clients, and module structure.
// ClientsModule.register: Configures microservice clients (PRESENCE_SERVICE, NOTIFICATION_SERVICE) for TCP
// communication, enabling the auth microservice to interact with other services using injectable ClientProxy instances.
