import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Hello, how are you doing?',
    description: 'The content of the message',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: '60d5f8b8e6b75d0015d89f3d',
    description: 'The ID of the user receiving the message',
  })
  @IsNotEmpty()
  receiverId: string;
}
