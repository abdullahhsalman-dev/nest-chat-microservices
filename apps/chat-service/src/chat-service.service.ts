import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Message } from '../../../libs/common/src/interfaces/message.interface';
import { CreateMessageDto } from '../../../libs/common/src/dto/create-message.dto';
import {
  EVENTS,
  SERVICES,
} from '../../../libs/common/src/constants/microservices';
import { AppException } from '../../../libs/common/src/exceptions/app.exception';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

  async sendMessage(userId: string, createMessageDto: CreateMessageDto) {
    try {
      const newMessage = new this.messageModel({
        content: createMessageDto.content,
        senderId: userId,
        receiverId: createMessageDto.receiverId,
      });

      const message = await newMessage.save();

      // Notify notification service about new message
      this.notificationClient.emit(EVENTS.MESSAGE_CREATED, {
        messageId: message._id,
        senderId: userId,
        receiverId: createMessageDto.receiverId,
        content: createMessageDto.content,
      });

      return {
        success: true,
        message: message,
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async getConversation(userId: string, otherUserId: string) {
    try {
      const messages = await this.messageModel
        .find({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        })
        .sort({ timestamp: 1 })
        .exec();

      return {
        success: true,
        messages,
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async getRecentConversations(userId: string) {
    try {
      // Get all messages for this user (sent or received)
      const messages = await this.messageModel
        .find({
          $or: [{ senderId: userId }, { receiverId: userId }],
        })
        .sort({ timestamp: -1 })
        .exec();

      // Extract unique conversation partners
      const conversations = new Map();

      messages.forEach((message) => {
        const partnerId =
          message.senderId === userId ? message.receiverId : message.senderId;

        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            userId: partnerId,
            lastMessage: message,
          });
        }
      });

      return {
        success: true,
        conversations: Array.from(conversations.values()),
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async markAsRead(userId: string, messageId: string) {
    try {
      const message = await this.messageModel.findById(messageId);

      if (!message) {
        return { success: false, message: 'Message not found' };
      }

      if (message.receiverId.toString() !== userId) {
        return { success: false, message: 'Unauthorized' };
      }

      message.read = true;
      await message.save();

      return {
        success: true,
        message: 'Message marked as read',
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }
}
