import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { SERVICES } from '../../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    // Passport for strategy support (e.g., JWT)
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Local config module
    ConfigModule,

    // JWT setup using async factory and config values
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiration || '1h',
        },
      }),
      inject: [ConfigService],
    }),

    // Microservice client for AUTH_SERVICE
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.authServiceHost || 'localhost',
            port: configService.authServicePort || 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
