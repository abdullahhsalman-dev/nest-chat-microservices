/**
 * Entry point for the API Gateway.
 * This file initializes the NestJS application, configures global settings,
 * sets up Swagger documentation, and starts the server.
 */

// Import NestJS core factory for creating the app
import { NestFactory } from '@nestjs/core';
// Import ValidationPipe for request data validation
import { ValidationPipe } from '@nestjs/common';
// Import Swagger modules for API documentation
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// Import the root module of the API Gateway
import { AppModule } from './api-gateway.module';
// import { NextFunction } from 'express';
import cookieParser from 'cookie-parser';

// Define the bootstrap function to initialize the application
async function bootstrap() {
  // Create a NestJS application instance with AppModule
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow cross-origin requests
  app.enableCors({
    origin: 'http://localhost:4000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie',
      'Set-Cookie',
    ],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
  });
  app.use(cookieParser());

  // Apply global validation pipe to validate incoming request data
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    // Set the API title
    .setTitle('Chat Microservices API')
    // Provide a description of the API
    .setDescription(
      'Real-time chat application API with authentication, messaging, and presence features',
    )
    // Specify the API version
    .setVersion('1.0')
    // Add JWT-based bearer authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth', // Key to reference this security scheme in controllers
    )
    // Add tag for authentication endpoints
    .addTag('auth', 'Authentication endpoints')
    // Add tag for chat-related endpoints
    .addTag('chat', 'Chat and messaging endpoints')
    // Add tag for presence-related endpoints
    .addTag('presence', 'Online/offline status endpoints')
    // Build the Swagger configuration
    .build();

  // Create Swagger document based on app and config
  const document = SwaggerModule.createDocument(app, config);
  // Set up Swagger UI at /api endpoint
  SwaggerModule.setup('api', app, document);

  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   console.log('🟡 Incoming Request Headers:', req.headers);
  //   next();
  // });

  // Start the server on port 3000
  await app.listen(3000);
  // Log that the server is running
  console.log('API Gateway is listening on port 3000');
  // Log the Swagger documentation URL
  console.log(
    'Swagger documentation is available at http://localhost:3000/api',
  );
}
// Execute the bootstrap function to start the application
bootstrap();
