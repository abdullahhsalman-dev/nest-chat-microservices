import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

// JWT Payload interface
interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Auth Microservice validation response
interface ValidateTokenResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// What gets attached to `req.user`
interface UserInfo {
  userId: string;
  username: string;
  email: string;
}

const cookieExtractor = (req: Request): string | null => {
  console.log('🍪 [cookieExtractor] All cookies:', req?.cookies);
  console.log('🍪 [cookieExtractor] Headers:', req?.headers?.cookie);

  const cookies = req?.cookies;

  if (cookies && typeof cookies['access_token'] === 'string') {
    console.log('✅ [cookieExtractor] Found access_token in cookies');
    return cookies['access_token'];
  }

  console.log('❌ [cookieExtractor] No access_token found in cookies');
  return null;
};

@Injectable()
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(SERVICES.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
      passReqToCallback: true,
    });

    console.log(
      '🔧 [JwtStrategy] Initialized with secret:',
      configService.jwtSecret ? 'SET' : 'NOT SET',
    );
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserInfo> {
    console.log('🔍 [JwtStrategy validate] Called with payload:', payload);
    console.log('🔍 [JwtStrategy validate] Request URL:', req.url);

    if (!payload?.sub) {
      console.log('❌ [JwtStrategy validate] Invalid payload - no sub');
      throw new UnauthorizedException('Invalid token payload');
    }

    console.log('[JwtStrategy] Validating payload:', payload);

    try {
      const response = await firstValueFrom(
        this.authClient.send<ValidateTokenResponse, string>(
          { cmd: 'validate_token' },
          payload.sub,
        ),
      );

      console.log('🔍 [JwtStrategy validate] Auth service response:', response);

      if (!response.success || !response.user) {
        console.log(
          '❌ [JwtStrategy validate] Validation failed:',
          response.message,
        );
        throw new UnauthorizedException(
          response.message || 'Token validation failed',
        );
      }

      const userInfo = {
        userId: response.user.id,
        username: response.user.username,
        email: response.user.email,
      };

      console.log(
        '✅ [JwtStrategy validate] Success, returning user:',
        userInfo,
      );
      return userInfo;
    } catch (error) {
      console.log('💥 [JwtStrategy validate] Error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
