import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../../libs/common/src/dto/login-user.dto';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const response = await firstValueFrom(
      this.authClient.send({ cmd: 'register' }, createUserDto),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const response = await firstValueFrom(
      this.authClient.send({ cmd: 'login' }, loginUserDto),
    );

    if (!response.success) {
      throw new HttpException(response.message, HttpStatus.UNAUTHORIZED);
    }

    return response;
  }
}
