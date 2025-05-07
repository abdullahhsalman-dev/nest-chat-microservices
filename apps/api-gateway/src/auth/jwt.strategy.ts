import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(SERVICES.AUTH_SERVICE) private authClient: ClientProxy) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // In production, use environment variables
    });
  }

  async validate(payload: any) {
    const response = await firstValueFrom(
      this.authClient.send({ cmd: 'validate_token' }, payload.sub),
    );

    if (!response.success) {
      throw new Error('Unauthorized');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
