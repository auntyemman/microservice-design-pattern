import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    // Register RabbitMQ with configuration
    RabbitMQModule.register({
      name: SERVICE_NAMES.NOTIFICATION_SERVICE,
      config: {
        exchanges: [
          {
            name: RABBITMQ.EXCHANGES.USER_EVENTS,
            type: 'topic',
          },
          {
            name: RABBITMQ.EXCHANGES.ORDER_EVENTS,
            type: 'topic',
          },
          {
            name: RABBITMQ.EXCHANGES.NOTIFICATION_EVENTS,
            type: 'topic',
          },
          {
            name: RABBITMQ.EXCHANGES.DELAYED,
            type: 'x-delayed-message',
            options: {
              arguments: { 'x-delayed-type': 'topic' },
            },
          },
          {
            name: RABBITMQ.EXCHANGES.RETRY,
            type: 'direct',
          },
        ],
        queues: [{}],
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
            exchange: RABBITMQ.EXCHANGES.ORDER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.ORDER_CREATED,
            queue: RABBITMQ.QUEUES.ORDER_CREATED,
          },
          {
            exchange: RABBITMQ.EXCHANGES.ORDER_EVENTS,
            routingKey: RABBITMQ.ROUTING_KEYS.ORDER_CONFIRMED,
            queue: RABBITMQ.QUEUES.ORDER_CONFIRMED,
          },
        ],
      },
    }),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
