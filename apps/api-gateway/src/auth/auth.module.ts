/**
 * Authentication Module for the API Gateway.
 * This module configures the authentication system, including JWT and Passport
 * integration, microservice communication, and controller setup for handling
 * authentication-related requests.
 */

// Import core NestJS module decorator
import { Module } from '@nestjs/common';
// Import JwtModule for JWT handling
import { JwtModule } from '@nestjs/jwt';
// Import PassportModule for authentication strategies
import { PassportModule } from '@nestjs/passport';
// Import ClientsModule for microservice communication
import { ClientsModule, Transport } from '@nestjs/microservices';
// Import the AuthController for handling auth-related HTTP requests
import { AuthController } from './auth.controller';
// Import the JwtStrategy for JWT validation
import { JwtStrategy } from './jwt.strategy';
// Import ConfigModule to access configuration settings
import { ConfigModule } from '../config/config.module';
// Import ConfigService to inject configuration values
import { ConfigService } from '../config/config.service';
// Import microservice constants
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// Define the AuthModule with the @Module decorator
@Module({
  // Specify modules to import for dependency injection
  imports: [
    // Enable Passport for authentication strategies
    PassportModule,
    // Import ConfigModule to provide ConfigService
    ConfigModule, // Import the ConfigModule to make ConfigService available
    // Configure JwtModule asynchronously to use ConfigService
    JwtModule.registerAsync({
      // Import ConfigModule for ConfigService access
      imports: [ConfigModule],
      // Factory function to configure JWT settings
      useFactory: (configService: ConfigService) => ({
        // Set the JWT secret from configuration
        secret: configService.jwtSecret,
        // Set JWT expiration from configuration
        signOptions: { expiresIn: configService.jwtExpiration },
      }),
      // Inject ConfigService into the factory
      inject: [ConfigService],
    }),
    // Configure microservice client for AUTH_SERVICE
    ClientsModule.registerAsync([
      {
        // Name of the microservice (AUTH_SERVICE)
        name: SERVICES.AUTH_SERVICE,
        // Import ConfigModule for ConfigService access
        imports: [ConfigModule],
        // Factory function to configure microservice connection
        useFactory: (configService: ConfigService) => ({
          // Use TCP transport for microservice communication
          transport: Transport.TCP,
          // Configure host and port from ConfigService
          options: {
            host: configService.authServiceHost,
            port: configService.authServicePort,
          },
        }),
        // Inject ConfigService into the factory
        inject: [ConfigService],
      },
    ]),
  ],
  // Register AuthController to handle HTTP requests
  controllers: [AuthController],
  // Register JwtStrategy as a provider for dependency injection
  providers: [JwtStrategy],
  // Export JwtStrategy for use in other modules
  exports: [JwtStrategy], // Export JwtStrategy if needed by other modules
})
// Export the AuthModule class
export class AuthModule {}
