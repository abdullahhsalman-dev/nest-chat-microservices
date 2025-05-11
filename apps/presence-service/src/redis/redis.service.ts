// apps/presence-service/src/redis/redis.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis'; // Use default import instead of * as Redis

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.logger.log(`Connecting to Redis at ${host}:${port}`);

    this.redisClient = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        // Retry connection with exponential backoff
        const delay = Math.min(times * 100, 3000);
        this.logger.warn(
          `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
        );
        return delay;
      },
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack);
    });

    // Test connection
    try {
      await this.redisClient.ping();
      this.logger.log('Redis connection verified with PING');
    } catch (err) {
      this.logger.error(`Failed to ping Redis: ${err.message}`, err.stack);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      this.logger.log('Closing Redis connection');
      await this.redisClient.quit();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
