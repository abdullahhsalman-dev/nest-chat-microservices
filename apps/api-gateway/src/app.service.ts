import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Welcome to the Chat API Gateway!' };
  }
}
