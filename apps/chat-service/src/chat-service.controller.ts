import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ChatService } from './chat-service.service';
import { CreateMessageDto } from '../../../libs/common/src/dto/create-message.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: 'send_message' })
  sendMessage(data: { userId: string; createMessageDto: CreateMessageDto }) {
    return this.chatService.sendMessage(data.userId, data.createMessageDto);
  }

  @MessagePattern({ cmd: 'get_conversation' })
  getConversation(data: { userId: string; otherUserId: string }) {
    return this.chatService.getConversation(data.userId, data.otherUserId);
  }

  @MessagePattern({ cmd: 'get_recent_conversations' })
  getRecentConversations(userId: string) {
    return this.chatService.getRecentConversations(userId);
  }

  @MessagePattern({ cmd: 'mark_as_read' })
  markAsRead(data: { userId: string; messageId: string }) {
    return this.chatService.markAsRead(data.userId, data.messageId);
  }
}
