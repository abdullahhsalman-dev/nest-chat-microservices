/**
 * Authentication Controller for the Auth Microservice.
 * This controller handles microservice messages for user registration, login,
 * and token validation, delegating logic to the AuthService.
 */

// Import NestJS Controller decorator
import { Controller } from '@nestjs/common';
// Import MessagePattern for microservice command handling
import { MessagePattern } from '@nestjs/microservices';
// Import the local AuthService for business logic
import { AuthService } from './auth-service.service'; // Import the local service
// Import DTO for user registration
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
// Import DTO for user login
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';

// Define the AuthController class
@Controller()
export class AuthController {
  // Inject the local AuthService for handling authentication logic
  constructor(private readonly authService: AuthService) {}

  // Handle 'register' microservice command for user registration
  @MessagePattern({ cmd: 'register' })
  register(createUserDto: CreateUserDto) {
    // Delegate registration logic to AuthService
    return this.authService.register(createUserDto);
  }

  // Handle 'login' microservice command for user login
  @MessagePattern({ cmd: 'login' })
  login(loginUserDto: LoginUserDto) {
    // Delegate login logic to AuthService
    return this.authService.login(loginUserDto);
  }

  // Handle 'validate_token' microservice command for token validation
  @MessagePattern({ cmd: 'validate_token' })
  validateToken(token: string) {
    // Delegate token validation logic to AuthService
    return this.authService.validateToken(token);
  }
}
