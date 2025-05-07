import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from '../../../../libs/common/src/dto/create-message.dto';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';
import { Message } from '../../../../libs/common/src/interfaces/message.interface';

// Define request user interface
interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    email: string;
  };
}

// Define response interfaces
interface MessageResponse {
  success: boolean;
  message: Message | string;
}

interface ConversationResponse {
  success: boolean;
  messages?: Message[];
  message?: string;
}

interface ConversationsResponse {
  success: boolean;
  conversations?: Array<{
    userId: string;
    lastMessage: Message;
  }>;
  message?: string;
}

interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

@Controller('chat')
export class ChatController {
  constructor(@Inject(SERVICES.CHAT_SERVICE) private chatClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  async sendMessage(
    @Request() req: RequestWithUser,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageResponse> {
    const response = await firstValueFrom<MessageResponse>(
      this.chatClient.send<
        MessageResponse,
        { userId: string; createMessageDto: CreateMessageDto }
      >({ cmd: 'send_message' }, { userId: req.user.userId, createMessageDto }),
    );

    if (!response.success) {
      throw new HttpException(
        typeof response.message === 'string'
          ? response.message
          : 'Failed to send message',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:userId')
  async getConversation(
    @Request() req: RequestWithUser,
    @Param('userId') otherUserId: string,
  ): Promise<ConversationResponse> {
    const response = await firstValueFrom<ConversationResponse>(
      this.chatClient.send<
        ConversationResponse,
        { userId: string; otherUserId: string }
      >({ cmd: 'get_conversation' }, { userId: req.user.userId, otherUserId }),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to get conversation',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getRecentConversations(
    @Request() req: RequestWithUser,
  ): Promise<ConversationsResponse> {
    const response = await firstValueFrom<ConversationsResponse>(
      this.chatClient.send<ConversationsResponse, string>(
        { cmd: 'get_recent_conversations' },
        req.user.userId,
      ),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to get recent conversations',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages/:messageId/read')
  async markAsRead(
    @Request() req: RequestWithUser,
    @Param('messageId') messageId: string,
  ): Promise<MarkAsReadResponse> {
    const response = await firstValueFrom<MarkAsReadResponse>(
      this.chatClient.send<
        MarkAsReadResponse,
        { userId: string; messageId: string }
      >({ cmd: 'mark_as_read' }, { userId: req.user.userId, messageId }),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to mark message as read',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }
}
