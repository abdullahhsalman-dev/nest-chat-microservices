// apps/auth-service/src/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

import { UserSchema } from './schemas/user.schema';
import { HealthController } from './health/health.controller';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-auth',
    ),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '1h' },
    }),
    ClientsModule.register([
      {
        name: SERVICES.PRESENCE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.PRESENCE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PRESENCE_SERVICE_PORT || '3002', 10),
        },
      },
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
        },
      },
    ]),
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthService],
})
export class AuthModule {}
