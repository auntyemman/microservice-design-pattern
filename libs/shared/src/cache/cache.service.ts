import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import Redis from 'ioredis';
import { REDIS } from '@app/shared/constants';

@Injectable()
export class RedisCacheService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    // Get the default Redis client instance
    this.redis = this.redisService.getClient();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      return data as any;
    }
  }

  async set(
    key: string,
    value: any,
    ttl: number = REDIS.CACHE_TTL,
  ): Promise<void> {
    if (typeof value === 'object') {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      await this.redis.set(key, value, 'EX', ttl);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(pattern: string = '*'): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async hashSet(key: string, field: string, value: any): Promise<void> {
    await this.redis.hset(
      key,
      field,
      typeof value === 'object' ? JSON.stringify(value) : value,
    );
  }

  async hashGet<T>(key: string, field: string): Promise<T | null> {
    const data = await this.redis.hget(key, field);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      return data as any;
    }
  }
}
