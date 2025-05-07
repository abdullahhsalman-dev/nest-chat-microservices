import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from '../../../libs/common/src/interfaces/user.interface';
import { CreateUserDto } from '../../../libs/common/src/dto/create-user.dto';
import { LoginUserDto } from '../../../libs/common/src/dto/login-user.dto';
import {
  EVENTS,
  SERVICES,
} from '../../../libs/common/src/constants/microservices';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    @Inject(SERVICES.PRESENCE_SERVICE) private presenceClient: ClientProxy,
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

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
      return { success: false, message: error.message };
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
      return { success: false, message: error.message };
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      return { success: false, message: 'Invalid token' };
    }
  }
}
