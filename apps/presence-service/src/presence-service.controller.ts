import { Controller, Get } from '@nestjs/common';
import { PresenceServiceService } from './presence-service.service';

@Controller()
export class PresenceServiceController {
  constructor(private readonly presenceServiceService: PresenceServiceService) {}

  @Get()
  getHello(): string {
    return this.presenceServiceService.getHello();
  }
}
