import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3004,
    },
  });

  // Also start a WebSocket server for real-time notifications
  const httpApp = await NestFactory.create(NotificationModule);
  httpApp.enableCors();

  await Promise.all([app.listen(), httpApp.listen(3005)]);

  console.log('Notification service is listening on TCP port 3004');
  console.log('WebSocket server is listening on HTTP port 3005');
}
bootstrap();
