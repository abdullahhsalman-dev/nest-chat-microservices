// apps/presence-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PresenceModule } from './presence-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('PresenceService');

  // Create hybrid application that can handle both HTTP and microservice protocols
  const app = await NestFactory.create(PresenceModule);

  // Configure microservice transport
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.PRESENCE_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.PRESENCE_SERVICE_PORT || '3002', 10),
    },
  });

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();
  await app.listen(3002);

  logger.log(
    `Presence service is listening on microservice transport and HTTP port 3002`,
  );
}
bootstrap();
