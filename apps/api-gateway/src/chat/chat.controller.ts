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

@Controller('chat')
export class ChatController {
  constructor(@Inject(SERVICES.CHAT_SERVICE) private chatClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const response = await firstValueFrom(
      this.chatClient.send(
        { cmd: 'send_message' },
        { userId: req.user.userId, createMessageDto },
      ),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:userId')
  async getConversation(@Request() req, @Param('userId') otherUserId: string) {
    const response = await firstValueFrom(
      this.chatClient.send(
        { cmd: 'get_conversation' },
        { userId: req.user.userId, otherUserId },
      ),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getRecentConversations(@Request() req) {
    const response = await firstValueFrom(
      this.chatClient.send(
        { cmd: 'get_recent_conversations' },
        req.user.userId,
      ),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages/:messageId/read')
  async markAsRead(@Request() req, @Param('messageId') messageId: string) {
    const response = await firstValueFrom(
      this.chatClient.send(
        { cmd: 'mark_as_read' },
        { userId: req.user.userId, messageId },
      ),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }
}
