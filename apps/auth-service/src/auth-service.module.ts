import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';
import { UserSchema } from './schemas/user.schema';
import { SERVICES } from '../../../libs/common/src/constants/microservices';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chat-auth'),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: 'secretKey', // In production, use environment variables
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: SERVICES.PRESENCE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
