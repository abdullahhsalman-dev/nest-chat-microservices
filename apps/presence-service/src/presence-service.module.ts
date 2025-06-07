// apps/presence-service/src/presence.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PresenceController } from './presence-service.controller';
import { PresenceService } from './presence-service.service';
import { HealthController } from './health/health.controller';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    RedisModule,
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
  controllers: [PresenceController, HealthController],
  providers: [PresenceService],
})
export class PresenceModule {}
