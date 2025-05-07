import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth-service.service';
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';

@Controller()
export class AuthController {
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
