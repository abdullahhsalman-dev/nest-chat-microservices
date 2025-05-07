import {
  Controller,
  Get,
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
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Controller('presence')
export class PresenceController {
  constructor(
    @Inject(SERVICES.PRESENCE_SERVICE) private presenceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/status')
  async getUserStatus(@Param('userId') userId: string) {
    const response = await firstValueFrom(
      this.presenceClient.send({ cmd: 'get_user_status' }, userId),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/online')
  async getOnlineUsers() {
    const response = await firstValueFrom(
      this.presenceClient.send({ cmd: 'get_online_users' }, {}),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }
}
