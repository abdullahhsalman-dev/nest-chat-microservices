// apps/api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PresenceModule } from './presence/presence.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.authServiceHost,
            port: configService.authServicePort,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: SERVICES.PRESENCE_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.presenceServiceHost,
            port: configService.presenceServicePort,
          },
        }),
        inject: [ConfigService],
      },
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
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.notificationServiceHost,
            port: configService.notificationServicePort,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
    ChatModule,
    PresenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
