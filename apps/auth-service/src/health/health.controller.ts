import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'auth-service', // Change this to match each service
      timestamp: new Date().toISOString(),
    };
  }
}
