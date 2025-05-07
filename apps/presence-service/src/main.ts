import { NestFactory } from '@nestjs/core';
import { PresenceServiceModule } from './presence-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PresenceServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
