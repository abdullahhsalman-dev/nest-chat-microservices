// apps/api-gateway/src/chat/chat.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from '../../../../libs/common/src/dto/create-message.dto';
import {
  SendMessageResponseDto,
  ConversationResponseDto,
} from '../../../../libs/common/src/dto/responses/message-responses.dto';
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
// interface MessageResponse {
//   success: boolean;
//   message: Message | string;
// }

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

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(@Inject(SERVICES.CHAT_SERVICE) private chatClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  @ApiOperation({ summary: 'Send a new message to another user' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message successfully sent',
    type: SendMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid message data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async sendMessage(
    @Request() req: RequestWithUser,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<SendMessageResponseDto> {
    const response = await firstValueFrom<SendMessageResponseDto>(
      this.chatClient.send<
        SendMessageResponseDto,
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
  @ApiOperation({ summary: 'Get conversation history with another user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get conversation with',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
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
  @ApiOperation({ summary: 'Get recent conversations with all users' })
  @ApiResponse({
    status: 200,
    description: 'Recent conversations retrieved successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
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
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({
    name: 'messageId',
    description: 'ID of the message to mark as read',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid message ID or unauthorized to mark this message',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
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
