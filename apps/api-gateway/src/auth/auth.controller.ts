// auth.controller.ts
// This controller is responsible for handling authentication-related HTTP requests in the API Gateway.
// It exposes endpoints for user registration and login. Requests are forwarded to the AuthService microservice
// via the ClientProxy to handle the actual authentication logic. The controller also manages error handling
// and returns appropriate responses.

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
// ClientProxy: From @nestjs/microservices, used to communicate with the AuthService microservice.
import { ClientProxy } from '@nestjs/microservices';
// firstValueFrom: Converts an RxJS Observable (returned by ClientProxy.send) into a Promise for easier handling.
import { firstValueFrom } from 'rxjs';
// ApiTags, ApiOperation, ApiResponse, ApiBody: Decorators from @nestjs/swagger to generate OpenAPI (Swagger)
// documentation for the API endpoints.
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
// CreateUserDto: Defines the structure of the request body for user registration (e.g., username, email, password).
import { CreateUserDto } from '../../../../libs/common/src/dto/create-user.dto';
// Defines the structure of the request body for user login (e.g., email/username, password).
import { LoginUserDto } from '../../../../libs/common/src/dto/login-user.dto';
// RegisterResponseDto, LoginResponseDto: Define the structure of the responses returned to the client.
import {
  RegisterResponseDto,
  LoginResponseDto,
} from '../../../../libs/common/src/dto/responses/auth-responses.dto';
// A constant (likely an enum or object) from a shared library that defines
// identifiers for microservices, including AUTH_SERVICE.
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

// Swagger Tag: @ApiTags('auth') groups the endpoints under the "auth" category in Swagger documentation.
// The AuthController class is decorated with @Controller('auth'), which makes it responsible for
// handling requests under the /auth base path (e.g., /auth/register, /auth/login).
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {}

  // @Post('register'): Defines a POST endpoint at /auth/register.
  // @ApiOperation: Documents the endpoint’s purpose in Swagger ("Register a new user").
  // @ApiBody: Specifies that the request body must conform to CreateUserDto.
  // @ApiResponse: Documents possible responses:
  // 201 Created: Successful registration, returning a RegisterResponseDto.
  // 400 Bad Request: Invalid data or user already exists.
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
  // The @Body() decorator extracts the request body into a createUserDto object.
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
