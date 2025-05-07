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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// Define interfaces for response types
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

@Controller('presence')
export class PresenceController {
  constructor(
    @Inject(SERVICES.PRESENCE_SERVICE) private presenceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/status')
  async getUserStatus(
    @Param('userId') userId: string,
  ): Promise<UserStatusResponse> {
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

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/online')
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
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

    return response;
  }
}
