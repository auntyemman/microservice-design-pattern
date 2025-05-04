import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { RedisModule } from 'nestjs-redis';
// import { RedisCacheService } from './redis-cache.service';
import { LocalCacheService } from './local-cache.service';

@Module({})
export class CacheModule {
  static register(): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        // RedisModule.forRootAsync({
        //   imports: [ConfigModule],
        //   inject: [ConfigService],
        //   useFactory: (configService: ConfigService) => ({
        //     host: configService.get('REDIS_HOST', 'localhost'),
        //     port: configService.get<number>('REDIS_PORT', 6379),
        //   }),
        // }),
      ],
      providers: [/*RedisCacheService,*/ LocalCacheService],
      exports: [/*RedisCacheService,*/ LocalCacheService ],
    };
  }
}
