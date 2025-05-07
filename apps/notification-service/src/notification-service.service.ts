import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  sendMessageNotification(data: {
    messageId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    const { messageId, senderId, receiverId, content } = data;

    // Send notification to the receiver via WebSocket
    this.notificationGateway.sendNotificationToUser(receiverId, {
      type: 'new_message',
      data: {
        messageId,
        senderId,
        preview:
          content.length > 30 ? `${content.substring(0, 30)}...` : content,
      },
    });

    return { success: true };
  }

  sendPresenceNotification(data: {
    userId: string;
    username?: string;
    status: 'online' | 'offline';
  }) {
    const { userId, username, status } = data;

    // Broadcast user presence change to all connected clients
    this.notificationGateway.broadcastNotification({
      type: 'presence_change',
      data: {
        userId,
        username,
        status,
      },
    });

    return { success: true };
  }
}
