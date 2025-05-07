import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ChatModule } from './chat-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ChatModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3003,
    },
  });
  await app.listen();
  console.log('Chat service is listening');
}
bootstrap();
