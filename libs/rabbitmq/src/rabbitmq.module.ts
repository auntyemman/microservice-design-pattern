import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQConfig } from './interfaces';
// import { SERVICE_NAMES } from '@app/shared/constants'

@Module({})
export class RabbitMQModule {
  static register(options: {
    name: string;
    config: RabbitMQConfig;
  }): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.register([
          {
            name: options.name,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: options.name,
              noAck: false,
              persistent: true,
              queueOptions: {
                durable: true,
                defaultRpcTimeout: 10000,
                defaultExchangeType: 'topic',
                connectionManagerOptions: {
                  heartbeatIntervalInSeconds: 15,
                  reconnectTimeInSeconds: 10,
                },
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
