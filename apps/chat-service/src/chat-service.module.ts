import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatController } from './chat-service.controller';
import { ChatService } from './chat-service.service';
import { MessageSchema } from './schemas/message.schema';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chat-messages'),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    ClientsModule.register([
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
