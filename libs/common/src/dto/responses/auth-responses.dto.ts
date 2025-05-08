import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: '60d5f8b8e6b75d0015d89f3d',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  email: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the registration was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'User registered successfully',
    description: 'A message about the registration result',
  })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the login was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authentication',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user: UserDto;
}
