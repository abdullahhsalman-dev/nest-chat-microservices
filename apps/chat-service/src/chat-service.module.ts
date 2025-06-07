import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatController } from './chat-service.controller';
import { ChatService } from './chat-service.service';
import { MessageSchema } from './schemas/message.schema';
import { HealthController } from './health/health.controller';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://mongodb:27017/chat-auth',
    ),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    ClientsModule.register([
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'notification-service',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
        },
      },
      {
        name: SERVICES.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'auth-service',
          port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
        },
      },
    ]),
  ],
  controllers: [ChatController, HealthController],
  providers: [ChatService],
})
export class ChatModule {}
