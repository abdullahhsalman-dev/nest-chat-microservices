// apps/api-gateway/src/presence/presence.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PresenceController } from './presence.controller';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    ConfigModule,
    // Register the PRESENCE_SERVICE client inside the PresenceModule
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [PresenceController],
})
export class PresenceModule {}
