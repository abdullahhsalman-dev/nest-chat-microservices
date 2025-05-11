// apps/auth-service/src/auth.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth-service.service'; // Import the local service
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';

@Controller()
export class AuthController {
  // Change from @Inject('auth_service') to use the local AuthService
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  login(loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern({ cmd: 'validate_token' })
  validateToken(token: string) {
    return this.authService.validateToken(token);
  }
}
