// apps/chat-service/src/chat.module.ts
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
      process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-messages',
    ),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    ClientsModule.register([
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
        },
      },
    ]),
  ],
  controllers: [ChatController, HealthController],
  providers: [ChatService],
})
export class ChatModule {}
