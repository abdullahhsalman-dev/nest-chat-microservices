import {
  Controller,
  Get,
  Param,
  UseGuards,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UserStatusResponseDto,
  OnlineUsersResponseDto,
} from '../../../../libs/common/src/dto/responses/presence-responses.dto';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// Define request user interface
interface UserStatusResponse {
  success: boolean;
  status?: string;
  lastSeen?: number;
  message?: string;
}

interface OnlineUsersResponse {
  success: boolean;
  users?: string[];
  message?: string;
}

@ApiTags('presence')
@ApiBearerAuth('JWT-auth')
@Controller('presence')
export class PresenceController {
  constructor(
    @Inject(SERVICES.PRESENCE_SERVICE) private presenceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/status')
  @ApiOperation({ summary: 'Get online/offline status of a user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get status for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User status retrieved successfully',
    type: UserStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID or user not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getUserStatus(
    @Param('userId') userId: string,
  ): Promise<UserStatusResponseDto> {
    const response = await firstValueFrom<UserStatusResponse>(
      this.presenceClient.send<UserStatusResponse, string>(
        { cmd: 'get_user_status' },
        userId,
      ),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to get user status',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!response.status || response.lastSeen === undefined) {
      throw new HttpException(
        'User status or last seen missing in response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Explicitly construct a UserStatusResponseDto-compatible object
    return {
      success: response.success,
      status: response.status,
      lastSeen: response.lastSeen,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/online')
  @ApiOperation({ summary: 'Get list of all online users' })
  @ApiResponse({
    status: 200,
    description: 'Online users list retrieved successfully',
    type: OnlineUsersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getOnlineUsers(): Promise<OnlineUsersResponseDto> {
    const response = await firstValueFrom<OnlineUsersResponse>(
      this.presenceClient.send<OnlineUsersResponse, Record<string, never>>(
        { cmd: 'get_online_users' },
        {},
      ),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to get online users',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!response.users) {
      throw new HttpException(
        'Online users list missing in response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Explicitly construct an OnlineUsersResponseDto-compatible object
    return {
      success: response.success,
      users: response.users,
    };
  }
}
