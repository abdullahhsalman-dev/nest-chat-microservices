import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
