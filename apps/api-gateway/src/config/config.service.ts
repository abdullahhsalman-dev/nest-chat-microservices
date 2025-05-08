import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  private getEnvVariable<T extends string | number>(
    key: string,
    defaultValue?: T,
  ): T {
    // Explicitly type the value as unknown to handle NestConfigService's type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const value: T | undefined = this.configService.get<T | undefined>(
      key,
      defaultValue,
    );
    // Validate the value
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }

    // Ensure the value matches the expected type (string or number)
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(
        `Environment variable ${key} must be a string or number, got: ${typeof value}`,
      );
    }

    return value;
  }

  private getNumberEnvVariable(key: string, defaultValue: number): number {
    const value = this.getEnvVariable<string>(key, defaultValue.toString());
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(
        `Environment variable ${key} must be a valid number, got: ${value}`,
      );
    }
    return parsed;
  }

  get apiGatewayPort(): number {
    return this.getNumberEnvVariable('API_GATEWAY_PORT', 3000);
  }

  get authServiceHost(): string {
    return this.getEnvVariable<string>('AUTH_SERVICE_HOST', 'localhost');
  }

  get authServicePort(): number {
    return this.getNumberEnvVariable('AUTH_SERVICE_PORT', 3001);
  }

  get presenceServiceHost(): string {
    return this.getEnvVariable<string>('PRESENCE_SERVICE_HOST', 'localhost');
  }

  get presenceServicePort(): number {
    return this.getNumberEnvVariable('PRESENCE_SERVICE_PORT', 3002);
  }

  get chatServiceHost(): string {
    return this.getEnvVariable<string>('CHAT_SERVICE_HOST', 'localhost');
  }

  get chatServicePort(): number {
    return this.getNumberEnvVariable('CHAT_SERVICE_PORT', 3003);
  }

  get notificationServiceHost(): string {
    return this.getEnvVariable<string>(
      'NOTIFICATION_SERVICE_HOST',
      'localhost',
    );
  }

  get notificationServicePort(): number {
    return this.getNumberEnvVariable('NOTIFICATION_SERVICE_PORT', 3004);
  }

  get jwtSecret(): string {
    return this.getEnvVariable<string>('JWT_SECRET', 'secretKey');
  }

  get jwtExpiration(): string {
    return this.getEnvVariable<string>('JWT_EXPIRATION', '3600');
  }
}
