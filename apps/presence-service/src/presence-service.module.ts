import { Module } from '@nestjs/common';
import { PresenceServiceController } from './presence-service.controller';
import { PresenceServiceService } from './presence-service.service';

@Module({
  imports: [],
  controllers: [PresenceServiceController],
  providers: [PresenceServiceService],
})
export class PresenceServiceModule {}
