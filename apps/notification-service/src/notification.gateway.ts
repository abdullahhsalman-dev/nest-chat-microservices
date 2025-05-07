import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to your frontend domain
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to store user's socket connections
  private userSockets: Map<string, string[]> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    // Associate socket ID with user ID
    const socketIds = this.userSockets.get(userId) || [];
    socketIds.push(client.id);
    this.userSockets.set(userId, socketIds);

    console.log(`Client connected: ${client.id}, userId: ${userId}`);
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

    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }

  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
