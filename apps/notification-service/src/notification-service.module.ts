import { Module } from '@nestjs/common';
import { NotificationController } from './notification-service.controller';
import { NotificationService } from './notification-service.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
