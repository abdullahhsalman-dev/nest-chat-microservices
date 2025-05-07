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

// Define response interfaces
interface RegisterResponse {
  success: boolean;
  message: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisterResponse> {
    const response = await firstValueFrom<RegisterResponse>(
      this.authClient.send<RegisterResponse, CreateUserDto>(
        { cmd: 'register' },
        createUserDto,
      ),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const response = await firstValueFrom<LoginResponse>(
      this.authClient.send<LoginResponse, LoginUserDto>(
        { cmd: 'login' },
        loginUserDto,
      ),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return response;
  }
}
