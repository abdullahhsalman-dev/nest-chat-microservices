// apps/chat-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ChatModule } from './chat-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ChatService');

  // Create hybrid application that can handle both HTTP and microservice protocols
  const app = await NestFactory.create(ChatModule);

  // Configure microservice transport
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.CHAT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.CHAT_SERVICE_PORT || '3003', 10),
    },
  });

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();
  await app.listen(3003);

  logger.log(
    `Chat service is listening on microservice transport and HTTP port 3003`,
  );
}
bootstrap();
