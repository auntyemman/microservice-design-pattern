import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQConfig, RabbitMQModuleOptions } from './interfaces';
import { RABBITMQ } from '@app/shared/constants';
import { RabbitMQService } from './rabbitmq.service';

@Module({})
export class RabbitMQModule {
  static register(options: RabbitMQModuleOptions): DynamicModule {
    const { name = RABBITMQ.CLIENT, config } = options;

    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: `${name}_queue`,
              noAck: true,
              persistent: true,
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
      providers: [
        {
          provide: 'RABBITMQ_CONFIG',
          useValue: config,
        },
        RabbitMQService,
      ],
      exports: [ClientsModule, RabbitMQService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<RabbitMQConfig> | RabbitMQConfig;
    inject?: any[];
  }): DynamicModule {
    const configProvider: Provider = {
      provide: 'RABBITMQ_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: RABBITMQ.CLIENT,
            useFactory: async () => ({
              transport: Transport.RMQ,
              options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                queue: `${RABBITMQ.CLIENT}_queue`,
                noAck: false,
                persistent: true,
                queueOptions: {
                  durable: true,
                },
              },
            }),
            inject: options.inject || [],
          },
        ]),
      ],
      providers: [configProvider, RabbitMQService],
      exports: [ClientsModule, RabbitMQService],
      global: true,
    };
  }
}
