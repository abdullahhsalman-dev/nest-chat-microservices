// apps/notification-service/src/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to your frontend domain
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  // Map to store user's socket connections
  private userSockets: Map<string, string[]> = new Map();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      this.logger.warn(
        `Client connected without userId, disconnecting: ${client.id}`,
      );
      client.disconnect();
      return;
    }

    // Associate socket ID with user ID
    const socketIds = this.userSockets.get(userId) || [];
    socketIds.push(client.id);
    this.userSockets.set(userId, socketIds);

    this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);

    // Send connection acknowledgment
    client.emit('connection_status', { connected: true, userId });
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Remove socket ID from user's connections
      const socketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = socketIds.filter((id) => id !== client.id);

      if (updatedSocketIds.length > 0) {
        this.userSockets.set(userId, updatedSocketIds);
      } else {
        this.userSockets.delete(userId);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}, userId: ${userId}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    try {
      const socketIds = this.userSockets.get(userId);
      if (socketIds && socketIds.length > 0) {
        this.logger.debug(
          `Sending notification to user ${userId} via ${socketIds.length} connections`,
        );
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('notification', notification);
        });
        return true;
      } else {
        this.logger.debug(
          `User ${userId} has no active connections, notification not sent`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error sending notification to user ${userId}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  broadcastNotification(notification: any) {
    try {
      this.logger.debug(`Broadcasting notification to all connected clients`);
      this.server.emit('notification', notification);
      return true;
    } catch (error) {
      this.logger.error(
        `Error broadcasting notification: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
