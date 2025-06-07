import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    example: '60d5f8b8e6b75d0015d89f3e',
    description: 'The unique identifier of the message',
  })
  id: string;

  @ApiProperty({
    example: 'Hello, how are you doing?',
    description: 'The content of the message',
  })
  content: string;

  @ApiProperty({
    example: '60d5f8b8e6b75d0015d89f3c',
    description: 'The ID of the user who sent the message',
  })
  senderId: string;

  @ApiProperty({
    example: '60d5f8b8e6b75d0015d89f3d',
    description: 'The ID of the user receiving the message',
  })
  receiverId: string;

  @ApiProperty({
    example: '2025-05-07T12:34:56.789Z',
    description: 'The timestamp when the message was sent',
  })
  timestamp: Date;

  @ApiProperty({
    example: false,
    description: 'Whether the message has been read by the recipient',
  })
  read: boolean;
}

export class SendMessageResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether sending the message was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'The created message',
    type: MessageDto,
  })
  message: MessageDto;
}

export class ConversationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether retrieving the conversation was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'List of messages in the conversation',
    type: [MessageDto],
  })
  messages: MessageDto[];
}
