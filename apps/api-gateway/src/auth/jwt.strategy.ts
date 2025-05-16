// apps/api-gateway/src/auth/jwt.strategy.ts
/**
 * JWT Strategy for Passport authentication in the API Gateway.
 * This file defines the JwtStrategy class, which extends PassportStrategy to handle
 * JSON Web Token (JWT) authentication. It extracts JWTs from the Authorization header,
 * verifies them using a secret key, and validates the token payload by communicating
 * with an authentication microservice. The strategy is used in conjunction with the
 * JwtAuthGuard to secure routes in the NestJS application.
 */

import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
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
  constructor(
    @Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
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
