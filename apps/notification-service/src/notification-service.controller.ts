import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationService } from './notification-service.service';
import { EVENTS } from '../../../libs/common/src/constants/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(EVENTS.MESSAGE_CREATED)
  handleMessageCreated(data: {
    messageId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    return this.notificationService.sendMessageNotification(data);
  }

  @EventPattern(EVENTS.USER_PRESENCE_CHANGED)
  handleUserPresenceChanged(data: {
    userId: string;
    username?: string;
    status: 'online' | 'offline';
  }) {
    return this.notificationService.sendPresenceNotification(data);
  }
}
