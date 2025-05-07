import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PresenceModule } from './presence-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(PresenceModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3002,
    },
  });
  await app.listen();
  console.log('Presence service is listening');
}
bootstrap();
