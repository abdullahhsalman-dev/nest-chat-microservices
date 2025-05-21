/**
 * Authentication Controller for the API Gateway.
 * This controller handles authentication-related HTTP requests in the API Gateway.
 * It exposes endpoints for user registration, login, and user retrieval. Requests
 * are forwarded to the AuthService microservice via the ClientProxy to handle the
 * actual authentication logic. The controller also manages error handling and
 * returns appropriate responses.
 */

// Import necessary NestJS decorators and modules
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  // UseGuards,
} from '@nestjs/common';
// Import ClientProxy for microservice communication
import { ClientProxy } from '@nestjs/microservices';
// Import firstValueFrom to convert RxJS Observables to Promises
import { firstValueFrom } from 'rxjs';
// Import Swagger decorators for API documentation
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
// Import JwtAuthGuard for protecting endpoints with JWT authentication
// import { JwtAuthGuard } from './jwt-auth.guard';
// Import DTOs for request/response validation
import { CreateUserDto } from '../../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../../libs/common/src/dto/login-user.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  GetUserResponseDto,
} from '../../../../libs/common/src/dto/responses/auth-responses.dto';
// Import microservice constants
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// Define response interfaces for type safety
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

// Swagger Tag: Groups endpoints under "auth" in Swagger documentation
// Controller: Handles requests under the /auth base path
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // Inject ClientProxy for communicating with the AuthService microservice
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {}

  // POST /auth/register: Register a new user
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

  // POST /auth/login: Authenticate user and return JWT token
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

    console.log('[API Gateway] Login response:', response); // ✅

    // Explicitly construct a LoginResponseDto-compatible object
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

  // GET /auth/user/:userId: Retrieve user information by ID
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user information by ID' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: GetUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User not found or invalid ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getUser(@Param('userId') userId: string): Promise<GetUserResponseDto> {
    console.log('----------------------------------- getting in user/userid');
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
}
