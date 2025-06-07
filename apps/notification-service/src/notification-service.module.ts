import { Module } from '@nestjs/common';
import { NotificationController } from './notification-service.controller';
import { NotificationService } from './notification-service.service';
import { NotificationGateway } from './notification.gateway';
import { HealthController } from './health/health.controller';

@Module({
  controllers: [NotificationController, HealthController],
  providers: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
