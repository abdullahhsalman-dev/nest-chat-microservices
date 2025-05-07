import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from './redis/redis.service';
import {
  EVENTS,
  SERVICES,
} from '../../../libs/common/src/constants/microservices';

@Injectable()
export class PresenceService {
  private readonly USERS_KEY = 'users';
  private readonly USER_STATUS_PREFIX = 'user:status:';
  private readonly USER_LAST_SEEN_PREFIX = 'user:last_seen:';

  constructor(
    private readonly redisService: RedisService,
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

  async handleUserCreated(data: { userId: string; username: string }) {
    const redis = this.redisService.getClient();

    // Store user in users list
    await redis.sadd(this.USERS_KEY, data.userId);

    // Set initial status as offline
    await redis.set(`${this.USER_STATUS_PREFIX}${data.userId}`, 'offline');

    // Set last seen time
    await redis.set(
      `${this.USER_LAST_SEEN_PREFIX}${data.userId}`,
      Date.now().toString(),
    );

    return { success: true };
  }

  async handleUserLoggedIn(data: { userId: string; username: string }) {
    const redis = this.redisService.getClient();

    // Set user status as online
    await redis.set(`${this.USER_STATUS_PREFIX}${data.userId}`, 'online');

    // Update last seen time
    await redis.set(
      `${this.USER_LAST_SEEN_PREFIX}${data.userId}`,
      Date.now().toString(),
    );

    // Notify about presence change
    this.notificationClient.emit(EVENTS.USER_PRESENCE_CHANGED, {
      userId: data.userId,
      username: data.username,
      status: 'online',
    });

    return { success: true };
  }

  async handleUserLoggedOut(data: { userId: string }) {
    const redis = this.redisService.getClient();

    // Set user status as offline
    await redis.set(`${this.USER_STATUS_PREFIX}${data.userId}`, 'offline');

    // Update last seen time
    await redis.set(
      `${this.USER_LAST_SEEN_PREFIX}${data.userId}`,
      Date.now().toString(),
    );

    // Notify about presence change
    this.notificationClient.emit(EVENTS.USER_PRESENCE_CHANGED, {
      userId: data.userId,
      status: 'offline',
    });

    return { success: true };
  }

  async getUserStatus(userId: string) {
    const redis = this.redisService.getClient();

    // Check if user exists
    const userExists = await redis.sismember(this.USERS_KEY, userId);
    if (!userExists) {
      return { success: false, message: 'User not found' };
    }

    // Get user status
    const status = await redis.get(`${this.USER_STATUS_PREFIX}${userId}`);

    // Get last seen time
    const lastSeen = await redis.get(`${this.USER_LAST_SEEN_PREFIX}${userId}`);

    return {
      success: true,
      status,
      lastSeen: Number(lastSeen),
    };
  }

  async getOnlineUsers() {
    const redis = this.redisService.getClient();

    // Get all users
    const users = await redis.smembers(this.USERS_KEY);

    // Filter online users
    const onlineUsers: string[] = [];

    for (const userId of users) {
      const status = await redis.get(`${this.USER_STATUS_PREFIX}${userId}`);
      if (status === 'online') {
        onlineUsers.push(userId);
      }
    }

    return {
      success: true,
      users: onlineUsers,
    };
  }
}
