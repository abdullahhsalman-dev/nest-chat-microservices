import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Message } from '../../../libs/common/src/interfaces/message.interface';
import { CreateMessageDto } from '../../../libs/common/src/dto/create-message.dto';
import {
  EVENTS,
  SERVICES,
} from '../../../libs/common/src/constants/microservices';
import { AppException } from '../../../libs/common/src/exceptions/app.exception';
import { User } from '../../../libs/common/src/interfaces/user.interface';

export interface ConversationResponse {
  success: boolean;
  messages: Message[];
  users?: Record<string, User>;
  errorMessage?: string;
  code?: string;
}

export interface RecentConversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface RecentConversationsResponse {
  success: boolean;
  conversations: RecentConversation[];
  users?: Record<string, User>;
  errorMessage?: string;
  code?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  errorMessage?: string;
  code?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
  errorMessage?: string;
  code?: string;
}

interface GetUsersResponse {
  success: boolean;
  users: User[];
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    // This line injects a ClientProxy instance for the auth-service microservice,
    // enabling the ChatService to send TCP messages (e.g., get_users) to the auth-service at the configured host (auth-service) and port (3001).
    @Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy,
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

  async sendMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<SendMessageResponse> {
    try {
      const newMessage = new this.messageModel({
        content: createMessageDto.content,
        senderId: new Types.ObjectId(userId),
        receiverId: new Types.ObjectId(createMessageDto.receiverId),
        timestamp: new Date(), // Pass Date object if schema expects Date
      });

      const message = await newMessage.save();

      try {
        this.notificationClient.emit(EVENTS.MESSAGE_CREATED, {
          messageId: message._id,
          senderId: userId,
          receiverId: createMessageDto.receiverId,
          content: createMessageDto.content,
          timestamp: message.timestamp,
        });
      } catch (notificationError) {
        console.warn(
          'Failed to notify notification service:',
          notificationError,
        );
      }

      return { success: true, message };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        return {
          success: false,
          errorMessage: error.message,
          code: error.code?.toString(),
        };
      }
      if (error instanceof Error) {
        return { success: false, errorMessage: error.message };
      }
      return { success: false, errorMessage: 'An unknown error occurred' };
    }
  }

  async getConversation(userId: string, otherUserId: string) {
    try {
      const messages = await this.messageModel
        .find({
          $or: [
            {
              senderId: new Types.ObjectId(userId),
              receiverId: new Types.ObjectId(otherUserId),
            },
            {
              senderId: new Types.ObjectId(otherUserId),
              receiverId: new Types.ObjectId(userId),
            },
          ],
        })
        .sort({ timestamp: 1 })
        .exec();

      // Fetch user data from auth-service
      const userResponse = await firstValueFrom<GetUsersResponse>(
        this.authClient.send({ cmd: 'get_users' }, [userId]),
      );

      console.log('User response:', userResponse);

      if (!userResponse.success) {
        throw new AppException('Failed to fetch users', 'USER_FETCH_FAILED');
      }

      const usersMap: Record<string, User> = userResponse.users.reduce(
        (map: Record<string, User>, user: User) => {
          map[user.id] = user;
          return map;
        },
        {},
      );

      return { success: true, messages, users: usersMap };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        return {
          success: false,
          errorMessage: error.message,
          code: error.code?.toString(),
        };
      }
      if (error instanceof Error) {
        return { success: false, errorMessage: error.message };
      }
      return { success: false, errorMessage: 'An unknown error occurred' };
    }
  }

  async getRecentConversations(userId: string) {
    try {
      const messages = await this.messageModel
        .find({
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
        })
        .sort({ timestamp: -1 })
        .exec();

      const conversationsMap = new Map<string, RecentConversation>();
      const userIds = new Set<string>();

      for (const message of messages) {
        const senderIdStr = message.senderId.toString();
        const receiverIdStr = message.receiverId.toString();
        const userIdStr = userId;

        const partnerId =
          senderIdStr === userIdStr ? receiverIdStr : senderIdStr;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            user: {
              id: partnerId,
              username: '',
              email: '',
              isOnline: false,
              lastSeen: new Date(),
              // include other optional user fields with default values or mark optional in User interface
            } as User,
            lastMessage: message,
            unreadCount: receiverIdStr === userIdStr && !message.read ? 1 : 0,
          });
          userIds.add(partnerId);
        } else if (message.receiverId.toString() === userId && !message.read) {
          const convo = conversationsMap.get(partnerId)!;
          convo.unreadCount += 1;
        }
      }

      // Fetch user data from auth-service
      const userResponse = await firstValueFrom<GetUsersResponse>(
        this.authClient.send({ cmd: 'get_users' }, Array.from(userIds)),
      );

      if (!userResponse.success) {
        throw new AppException('Failed to fetch users', 'USER_FETCH_FAILED');
      }

      const usersMap: Record<string, User> = userResponse.users.reduce(
        (map: Record<string, User>, user: User) => {
          map[user.id] = user;
          return map;
        },
        {},
      );

      for (const [partnerId, convo] of conversationsMap.entries()) {
        convo.user = usersMap[partnerId] || convo.user;
      }

      return {
        success: true,
        conversations: Array.from(conversationsMap.values()),
        users: usersMap,
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          errorMessage: error.message,
          code: error.code?.toString(),
        };
      }
      if (error instanceof Error) {
        return { success: false, errorMessage: error.message };
      }
      return { success: false, errorMessage: 'An unknown error occurred' };
    }
  }

  async markAsRead(
    userId: string,
    messageId: string,
  ): Promise<MarkAsReadResponse> {
    try {
      const message = await this.messageModel.findById(messageId);

      if (!message) {
        return { success: false, errorMessage: 'Message not found' };
      }

      if (message.receiverId.toString() !== userId) {
        return { success: false, errorMessage: 'Unauthorized' };
      }

      message.read = true;
      await message.save();

      return { success: true, message: 'Message marked as read' };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        return {
          success: false,
          errorMessage: error.message,
          code: error.code?.toString(),
        };
      }
      if (error instanceof Error) {
        return { success: false, errorMessage: error.message };
      }
      return { success: false, errorMessage: 'An unknown error occurred' };
    }
  }
}
