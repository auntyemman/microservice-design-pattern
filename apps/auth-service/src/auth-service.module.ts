import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@app/rabbitmq';
import { CacheModule } from '@app/shared';
import { UserProducer } from './producers/user.producer';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { UserGrpcController } from './controllers/user.grpc.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
// import { Role } from './domain/entities/role.entity';
// import { Permission } from './domain/entities/permission.entity';
import { UserRepository } from './repositories/user.repository';
import { UserConsumer } from './consumers/user.consumer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared';

@Module({
  imports: [
    // Config module setup
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection setup
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get('POSTGRES_DB', 'auth_service'),
        entities: [User /*Role, Permission*/],
        synchronize: configService.get<boolean>('DB_SYNC', true),
      }),
    }),

    // Entity registration
    TypeOrmModule.forFeature([User /*Role, Permission*/]),

    // JWT setup for authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'super-secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

    // Redis cache setup (shared across services)
    CacheModule.register(),

    // Scheduled module
    ScheduleModule.forRoot(),

    // RabbitMQ setup with worker/retry capability
    RabbitMQModule.register({
      name: RABBITMQ.CLIENT,
      config: {
        exchanges: [
          {
            name: RABBITMQ.EXCHANGES.USER_EVENTS,
            type: 'topic',
          },
          {
            name: RABBITMQ.EXCHANGES.DELAYED,
            type: 'x-delayed-message',
            options: {
              arguments: {
                'x-delayed-type': 'topic',
              },
            },
          },
          {
            name: RABBITMQ.EXCHANGES.RETRY,
            type: 'topic',
          },
        ],
        queues: [
          {
            name: RABBITMQ.QUEUES.USER_CREATED,
            options: { durable: true },
          },
          {
            name: RABBITMQ.QUEUES.USER_UPDATED,
            options: { durable: true },
          },
          {
            name: RABBITMQ.QUEUES.BACKGROUND_JOBS,
            options: { durable: true },
          },
          {
            name: RABBITMQ.QUEUES.SCHEDULED_TASKS,
            options: { durable: true },
          },
          {
            name: RABBITMQ.QUEUES.USER_RETRY,
            options: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': RABBITMQ.EXCHANGES.USER_EVENTS,
                'x-dead-letter-routing-key': RABBITMQ.ROUTING_KEYS.USER_CREATED,
              },
            },
          },
        ],
        bindings: [
          {
            exchange: RABBITMQ.EXCHANGES.USER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.USER_CREATED,
            queue: RABBITMQ.QUEUES.USER_CREATED,
          },
          {
            exchange: RABBITMQ.EXCHANGES.USER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.USER_UPDATED,
            queue: RABBITMQ.QUEUES.USER_UPDATED,
          },
          {
            exchange: RABBITMQ.EXCHANGES.USER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
            queue: RABBITMQ.QUEUES.BACKGROUND_JOBS,
          },
          {
            exchange: RABBITMQ.EXCHANGES.USER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.SCHEDULED_TASK,
            queue: RABBITMQ.QUEUES.SCHEDULED_TASKS,
          },
          {
            exchange: RABBITMQ.EXCHANGES.RETRY,
            routingKey: RABBITMQ.ROUTING_KEYS.USER_RETRY,
            queue: RABBITMQ.QUEUES.USER_RETRY,
          },
        ],
      },
    }),
  ],

  controllers: [AuthController, UserController, UserGrpcController],

  providers: [
    AuthService,
    UserService,
    UserRepository,
    UserProducer,
    UserConsumer,
    {
      provide: 'APP_NAME',
      useValue: SERVICE_NAMES.AUTH_SERVICE,
    },
  ],
})
export class AuthModule {}
