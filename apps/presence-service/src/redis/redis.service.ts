import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis.Redis;

  async onModuleInit() {
    this.redisClient = new Redis({
      host: 'localhost', // In production, use environment variables
      port: 6379,
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  getClient(): Redis.Redis {
    return this.redisClient;
  }
}
