import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../libs/common/src/interfaces/user.interface';
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';
import {
  EVENTS,
  SERVICES,
} from '../../../libs/common/src/constants/microservices';
import { AppException } from '../../../libs/common/src/exceptions/app.exception';
// interface JwtPayload {
//   sub: string; // Subject (user ID)
//   username: string; // Username
//   email: string; // Email
//   iat?: number; // Issued at timestamp
//   exp?: number; // Expiration timestamp
// }
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    @Inject(SERVICES.PRESENCE_SERVICE) private presenceClient: ClientProxy,
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

  //   A Mongoose User model for database operations.
  // A JwtService for JWT token management.
  // ClientProxy instances for the PRESENCE_SERVICE and NOTIFICATION_SERVICE microservices to emit events or send messages.
  //  These dependencies are injected via NestJS’s dependency injection system, configured in AuthModule,
  //  and used in methods like register, login, and validateToken.

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      const newUser = new this.userModel(createUserDto);
      const user = await newUser.save();

      // Notify other services about user creation
      this.presenceClient.emit(EVENTS.USER_CREATED, {
        userId: user._id,
        username: user.username,
      });

      return {
        success: true,
        message: 'User registered successfully',
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.userModel.findOne({ email: loginUserDto.email });
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Update user status to online
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Notify other services about user login
      this.presenceClient.emit(EVENTS.USER_LOGGED_IN, {
        userId: user._id,
        username: user.username,
      });

      // Generate JWT token
      const payload = {
        sub: user._id,
        username: user.username,
        email: user.email,
      };
      return {
        success: true,
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        // Handle cases where error is neither AppException nor Error
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async validateToken(userId: string) {
    // ✅ Change parameter from 'token' to 'userId'
    console.log('🔍 [Auth Service] validateToken called with userId:', userId);

    try {
      // ✅ Remove JWT verification since API Gateway already did that
      // ✅ Use userId directly to find user
      const user = await this.userModel.findById(userId);

      console.log(
        '🔍 [Auth Service] User lookup result:',
        user ? 'Found' : 'Not found',
      );

      if (!user) {
        console.log('❌ [Auth Service] User not found for ID:', userId);
        return {
          success: false,
          message: 'User not found',
        };
      }

      console.log('✅ [Auth Service] User found:', {
        id: user._id,
        username: user.username,
        email: user.email,
      });

      return {
        success: true,
        user: {
          id: user._id.toString(), // ✅ Convert ObjectId to string
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      console.log('💥 [Auth Service] validateToken error:', error);

      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async getUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        },
      };
    } catch (error) {
      if (error instanceof AppException) {
        return {
          success: false,
          message: error.message,
          code: error.code,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      } else {
        return {
          success: false,
          message: 'An unknown error occurred',
        };
      }
    }
  }

  async getUsers(
    userIds: string[],
  ): Promise<{ success: boolean; users: User[]; message?: string }> {
    try {
      const users = await this.userModel
        .find({ _id: { $in: userIds } })
        .select('_id username email isOnline lastSeen')
        .exec();

      const userData: User[] = users.map((user) => ({
        id: user._id.toString(),
        username: user.username || 'Unknown',
        email: user.email || '',
        password: '',
        isOnline: user.isOnline ?? false,
        lastSeen: user.lastSeen ?? new Date(),
      }));

      return { success: true, users: userData };
    } catch (error) {
      console.log('💥 [Auth Service] getUsers error:', error);
      if (error instanceof AppException) {
        return {
          success: false,
          users: [],
          message: error.message,
        };
      } else if (error instanceof Error) {
        return { success: false, users: [], message: error.message };
      } else {
        return {
          success: false,
          users: [],
          message: 'An unknown error occurred',
        };
      }
    }
  }
}
