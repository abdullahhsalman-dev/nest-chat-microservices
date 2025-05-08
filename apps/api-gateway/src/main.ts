// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Chat Microservices API')
    .setDescription(
      'Real-time chat application API with authentication, messaging, and presence features',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth', // This is a key to reference this security scheme
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('chat', 'Chat and messaging endpoints')
    .addTag('presence', 'Online/offline status endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('API Gateway is listening on port 3000');
  console.log(
    'Swagger documentation is available at http://localhost:3000/api',
  );
}
bootstrap();
