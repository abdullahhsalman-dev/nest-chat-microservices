import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PresenceController } from './presence-service.controller';
import { PresenceService } from './presence-service.service';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    RedisModule,
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
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule {}
