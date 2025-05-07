import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis'; // Use default import instead of * as Redis

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis; // Type is the default export (Redis class)

  async onModuleInit() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });

    await this.redisClient.ping();
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
