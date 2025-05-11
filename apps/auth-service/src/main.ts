// apps/auth-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');

  // Create hybrid application that can handle both HTTP and microservice protocols
  const app = await NestFactory.create(AuthModule);

  // Configure microservice transport
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    },
  });

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();
  await app.listen(3001);

  logger.log(
    `Auth service is listening on microservice transport and HTTP port 3001`,
  );
}
bootstrap();
