import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(
    exchange: string,
    routingKey: string,
    message: any,
  ): Promise<void> {
    await this.amqpConnection.publish(exchange, routingKey, message);
  }

  async publishWithDelay(
    exchange: string,
    routingKey: string,
    message: any,
    delayMs: number,
  ): Promise<void> {
    await this.amqpConnection.publish(exchange, routingKey, message, {
      headers: {
        'x-delay': delayMs,
      },
    });
  }

  async subscribe<T>(
    queue: string,
    handler: (msg: T) => Promise<void>,
  ): Promise<void> {
    await this.amqpConnection.createSubscriber((msg: T) => handler(msg), {
      queue,
      queueOptions: {
        durable: true,
        arguments: {
          'x-queue-type': 'classic',
        },
      },
    });
  }
}
