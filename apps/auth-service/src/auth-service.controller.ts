// apps/api-gateway/src/auth/auth.controller.ts
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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
} from '../../../libs/common/src/dto/responses/auth-responses.dto';
import { SERVICES } from '../../../libs/common/src/constants/microservices';
interface RegisterResponse {
  success: boolean;
  message: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  access_token: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or user already exists',
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisterResponseDto> {
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
  @ApiOperation({ summary: 'Authenticate user and get token' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
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

    if (!response.access_token) {
      throw new HttpException(
        'Access token missing in response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Ensure user is present if required by LoginResponseDto
    if (!response.user) {
      throw new HttpException(
        'User data missing in response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Explicitly construct a LoginResponseDto-compatible object
    return {
      success: response.success,
      access_token: response.access_token, // Guaranteed to be string
      user: {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
      },
    };
  }
}
