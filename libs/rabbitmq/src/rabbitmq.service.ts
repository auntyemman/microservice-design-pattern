// rabbitmq/rabbitmq.service.ts
import {
  Inject,
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQConfig } from './interfaces';
import { RABBITMQ } from '@app/shared/constants';
import * as amqp from 'amqplib';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnApplicationShutdown {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private initialized = false;
  private consumers: Map<string, string> = new Map();

  constructor(
    @Inject(RABBITMQ.CLIENT) private readonly client: ClientProxy,
    @Inject('RABBITMQ_CONFIG') private readonly config: RabbitMQConfig,
  ) {}

  async onModuleInit() {
    try {
      // Initialize client connection
      await this.client.connect();

      // Setup direct connection for advanced operations
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      );
      this.channel = await this.connection.createChannel();

      // Setup exchanges
      for (const exchange of this.config.exchanges) {
        await this.channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options || { durable: true },
        );
      }

      // Setup queues
      for (const queue of this.config.queues) {
        await this.channel.assertQueue(
          queue.name,
          queue.options || { durable: true },
        );
      }

      // Setup bindings
      for (const binding of this.config.bindings) {
        await this.channel.bindQueue(
          binding.queue,
          binding.exchange,
          binding.routingKey,
        );
      }

      this.initialized = true;
      console.log('RabbitMQ connections and channels initialized');
    } catch (error) {
      console.error('Error initializing RabbitMQ:', error);
      throw error;
    }
  }

  async onApplicationShutdown() {
    // Cancel consumers
    for (const [queue, consumerTag] of this.consumers.entries()) {
      try {
        await this.channel.cancel(consumerTag);
      } catch (error) {
        console.error(`Error cancelling consumer for queue ${queue}:`, error);
      }
    }

    // Close connections
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      await this.client.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connections:', error);
    }
  }

  /**
   * Publish a message to an exchange with a routing key
   */
  async publish(
    exchange: string,
    routingKey: string,
    message: any,
  ): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('RabbitMQ service not initialized');
    }

    return this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  /**
   * Publish a message with a delay
   */
  async publishWithDelay(
    exchange: string,
    routingKey: string,
    message: any,
    delayMs: number,
  ): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('RabbitMQ service not initialized');
    }

    // Make sure we're using the delayed exchange
    return this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        headers: { 'x-delay': delayMs },
      },
    );
  }

  /**
   * Send a message directly to a queue
   */
  async sendToQueue(queue: string, message: any): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('RabbitMQ service not initialized');
    }

    return this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  /**
   * Schedule a task to be executed after a delay
   */
  async scheduleTask(
    task: string,
    payload: any,
    delayMs: number,
  ): Promise<boolean> {
    return this.publishWithDelay(
      RABBITMQ.EXCHANGES.DELAYED,
      RABBITMQ.ROUTING_KEYS.SCHEDULED_TASK,
      {
        task,
        payload,
        scheduledAt: Date.now(),
        executeAt: Date.now() + delayMs,
      },
      delayMs,
    );
  }

  /**
   * Enqueue a background job for processing
   */
  async enqueueJob(
    jobType: string,
    payload: any,
    options: { priority?: number } = {},
  ): Promise<boolean> {
    return this.publish(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
      {
        jobType,
        payload,
        priority: options.priority || 0,
        enqueuedAt: Date.now(),
      },
    );
  }

  /**
   * Set up a consumer for a queue with automatic message acknowledgement
   */
  async consume<T = any>(
    queue: string,
    handler: (message: T) => Promise<void>,
    options: { noAck?: boolean } = {},
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('RabbitMQ service not initialized');
    }

    const consumerTag = (
      await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);

            if (!options.noAck) {
              this.channel.ack(msg);
            }
          } catch (error) {
            console.error(
              `Error processing message from queue ${queue}:`,
              error,
            );

            // Nack the message and don't requeue it if it has been retried too many times
            // Check headers for retry count
            const retryCount = (msg.properties.headers?.retryCount || 0) + 1;
            const maxRetries = 3; // Configure as needed

            if (retryCount <= maxRetries) {
              // Delay retry with exponential backoff
              const delay = Math.pow(2, retryCount) * 1000;

              // Update headers
              const headers = { ...(msg.properties.headers || {}), retryCount };

              // Publish to retry exchange
              await this.publishWithDelay(
                RABBITMQ.EXCHANGES.RETRY,
                msg.fields.routingKey,
                JSON.parse(msg.content.toString()),
                delay,
              );

              this.channel.ack(msg);
            } else {
              // Message has been retried too many times, dead-letter it
              this.channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      )
    ).consumerTag;

    this.consumers.set(queue, consumerTag);
  }

  /**
   * Send a message using NestJS microservice pattern
   */
  async send<TResult = any, TInput = any>(
    pattern: string,
    data: TInput,
  ): Promise<TResult> {
    return firstValueFrom(this.client.send<TResult, TInput>(pattern, data));
  }

  /**
   * Emit an event using NestJS microservice pattern
   */
  async emit<TInput = any>(pattern: string, data: TInput): Promise<void> {
    this.client.emit<void, TInput>(pattern, data);
  }

  /**
   * Get the channel for advanced operations
   */
  getChannel(): amqp.Channel {
    return this.channel;
  }
}
