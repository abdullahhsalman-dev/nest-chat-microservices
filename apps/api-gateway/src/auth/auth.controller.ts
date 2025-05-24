import { Response } from 'express';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from '../../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../../libs/common/src/dto/login-user.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  GetUserResponseDto,
} from '../../../../libs/common/src/dto/responses/auth-responses.dto';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

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

interface GetUsersResponse {
  success: boolean;
  users: Array<{
    id: string;
    username: string;
    email: string;
    isOnline: boolean;
    lastSeen: Date;
  }>;
  message?: string;
}

interface RequestWithUser extends Request {
  user: {
    userId: string;
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
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const response = await firstValueFrom<LoginResponse>(
      this.authClient.send<LoginResponse, LoginUserDto>(
        { cmd: 'login' },
        loginUserDto,
      ),
    );

    if (!response.success || !response.access_token || !response.user) {
      throw new HttpException(
        response.message || 'Authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    console.log('[API Gateway] Login response:', response);

    return {
      success: response.success,
      access_token: response.access_token,
      user: {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('user/me')
  @ApiOperation({
    summary: 'Get information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: GetUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getMe(@Request() req: RequestWithUser): Promise<GetUserResponseDto> {
    const { userId } = req.user;

    const response = await firstValueFrom<GetUserResponseDto>(
      this.authClient.send({ cmd: 'get_user' }, { userId }),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to retrieve user',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('users')
  @ApiOperation({
    summary: 'Get information of multiple users by their IDs',
  })
  @ApiBody({
    description: 'Array of user IDs',
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['682104ab3a73b39778831583', 'anotherUserId'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              isOnline: { type: 'boolean' },
              lastSeen: { type: 'string', format: 'date-time' },
            },
          },
        },
        message: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getUsers(
    @Body('userIds') userIds: string[],
  ): Promise<GetUsersResponse> {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new HttpException(
        'Invalid or empty user IDs',
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await firstValueFrom<GetUsersResponse>(
      this.authClient.send({ cmd: 'get_users' }, userIds),
    );

    if (!response.success) {
      throw new HttpException(
        response.message || 'Failed to retrieve users',
        HttpStatus.BAD_REQUEST,
      );
    }

    return response;
  }
}
