// apps/auth-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');

  // Create hybrid application that can handle both HTTP and microservice protocols
  const app = await NestFactory.create(AuthModule);

  // Configure microservice transport - keep port 3001 for TCP
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Listen on all interfaces
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    },
  });

  // Start both HTTP and microservice servers
  await app.startAllMicroservices();

  // Use a DIFFERENT port for HTTP (3101)
  await app.listen(3101);

  logger.log(`Auth service is listening on TCP port 3001 and HTTP port 3101`);
}
bootstrap();
