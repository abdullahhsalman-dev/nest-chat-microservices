import { ApiProperty } from '@nestjs/swagger';

export class UserStatusResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether retrieving the user status was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'online',
    description: 'The current status of the user (online/offline)',
    enum: ['online', 'offline'],
  })
  status: string;

  @ApiProperty({
    example: 1683448496000,
    description:
      'The timestamp of when the user was last seen (Unix timestamp in ms)',
  })
  lastSeen: number;
}

export class OnlineUsersResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether retrieving online users was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'List of IDs of users who are currently online',
    example: ['60d5f8b8e6b75d0015d89f3c', '60d5f8b8e6b75d0015d89f3d'],
    type: [String],
  })
  users: string[];
}
