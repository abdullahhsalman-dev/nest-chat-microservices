// apps/notification-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  // Create hybrid application that can handle both HTTP (for health checks and WebSockets)
  // and microservice protocols (for TCP)
  const app = await NestFactory.create(NotificationModule);

  // Configure microservice transport
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
    },
  });

  // Enable CORS for WebSocket connections
  app.enableCors();

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();
  await app.listen(3005); // WebSocket server on 3005

  logger.log(
    `Notification service is listening on microservice transport port 3004 and WebSocket port 3005`,
  );
}
bootstrap();
