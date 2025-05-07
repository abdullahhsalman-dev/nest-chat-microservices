import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { PresenceService } from './presence-service.service';

@Controller()
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @MessagePattern({ cmd: 'get_user_status' })
  getUserStatus(userId: string) {
    return this.presenceService.getUserStatus(userId);
  }

  @MessagePattern({ cmd: 'get_online_users' })
  getOnlineUsers() {
    return this.presenceService.getOnlineUsers();
  }

  @EventPattern('user.created')
  handleUserCreated(data: { userId: string; username: string }) {
    return this.presenceService.handleUserCreated(data);
  }

  @EventPattern('user.logged.in')
  handleUserLoggedIn(data: { userId: string; username: string }) {
    return this.presenceService.handleUserLoggedIn(data);
  }

  @EventPattern('user.logged.out')
  handleUserLoggedOut(data: { userId: string }) {
    return this.presenceService.handleUserLoggedOut(data);
  }
}
