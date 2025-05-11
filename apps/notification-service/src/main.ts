import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  // Create hybrid application
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

  // Start microservice and HTTP server for health checks
  await app.startAllMicroservices();
  await app.listen(3104); // HTTP server for health checks on 3104

  logger.log(
    `Notification service is listening on microservice transport port 3004 and HTTP/health check port 3104`,
  );
}
bootstrap();
