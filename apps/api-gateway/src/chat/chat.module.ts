// apps/api-gateway/src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatController } from './chat.controller';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    ConfigModule,
    // Register the CHAT_SERVICE client inside the ChatModule
    ClientsModule.registerAsync([
      {
        name: SERVICES.CHAT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.chatServiceHost,
            port: configService.chatServicePort,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ChatController],
})
export class ChatModule {}

//  Chat Factory:
// What is it?: The useFactory in ClientsModule.registerAsync is a factory function that creates the configuration for the CHAT_SERVICE microservice client.
// Why?: It dynamically sets the host and port from ConfigService (chatServiceHost, chatServicePort) for TCP communication.
// How?: Injects ConfigService to access configuration values, ensuring flexibility and environment-specific settings.
