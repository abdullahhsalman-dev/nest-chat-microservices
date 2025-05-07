import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// Define the JWT payload interface
interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Define the validate token response interface
interface ValidateTokenResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Define the user object returned by validate method
interface UserInfo {
  userId: string;
  username: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // In production, use environment variables
    });
  }

  async validate(payload: JwtPayload): Promise<UserInfo> {
    const response = await firstValueFrom<ValidateTokenResponse>(
      this.authClient.send<ValidateTokenResponse, string>(
        { cmd: 'validate_token' },
        payload.sub,
      ),
    );

    if (!response.success) {
      throw new Error(response.message || 'Unauthorized');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
