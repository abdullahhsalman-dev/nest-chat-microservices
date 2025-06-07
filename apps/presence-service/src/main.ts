// apps/presence-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PresenceModule } from './presence-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('PresenceService');

  // Create hybrid application that can handle both HTTP and microservice protocols
  const app = await NestFactory.create(PresenceModule);

  // Configure microservice transport - keep port 3002 for TCP
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Listen on all interfaces
      port: parseInt(process.env.PRESENCE_SERVICE_PORT || '3002', 10),
    },
  });

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();

  // Use a DIFFERENT port for HTTP (3102)
  await app.listen(3102);

  logger.log(
    `Presence service is listening on TCP port 3002 and HTTP port 3102`,
  );
}
bootstrap();
