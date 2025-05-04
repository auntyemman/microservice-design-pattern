import {
  Inject,
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Logger,
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
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(RABBITMQ.CLIENT) private readonly client: ClientProxy,
    @Inject('RABBITMQ_CONFIG') private readonly config: RabbitMQConfig,
  ) {}

  async onModuleInit() {
    try {
      // Initialize the NestJS ClientProxy connection
      await this.client.connect();
      this.logger.log('NestJS RabbitMQ client connected');

      // Only setup direct connection if advanced features are needed
      if (this.needsDirectConnection()) {
        await this.setupDirectConnection();
      }

      this.initialized = true;
      this.logger.log('RabbitMQ service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ service', error);
      throw error;
    }
  }

  private needsDirectConnection(): boolean {
    // Check if configuration requires advanced features
    const hasDelayedExchange = this.config.exchanges?.some(
      (exchange) => exchange.type === 'x-delayed-message',
    );
    const hasCustomHeaders = this.config.queues?.some(
      (queue) => queue.options?.arguments,
    );

    // Return true if we need advanced features
    return (
      hasDelayedExchange ||
      hasCustomHeaders ||
      this.config.exchanges?.length > 0 ||
      this.config.queues?.length > 0
    );
  }

  private async setupDirectConnection(): Promise<void> {
    this.logger.log('Setting up direct AMQP connection for advanced features');

    // Get connection URL from the same place NestJS client uses
    const connectionUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    // Setup direct connection
    this.connection = await amqp.connect(connectionUrl);
    this.channel = await this.connection.createChannel();

    // Setup topology (exchanges, queues, bindings)
    await this.setupTopology();
  }

  private async setupTopology(): Promise<void> {
    // Setup exchanges
    if (this.config.exchanges?.length) {
      for (const exchange of this.config.exchanges) {
        await this.channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options || { durable: true },
        );
        this.logger.debug(`Exchange created: ${exchange.name}`);
      }
    }

    // Setup queues
    if (this.config.queues?.length) {
      for (const queue of this.config.queues) {
        await this.channel.assertQueue(
          queue.name,
          queue.options || { durable: true },
        );
        this.logger.debug(`Queue created: ${queue.name}`);
      }
    }

    // Setup bindings
    if (this.config.bindings?.length) {
      for (const binding of this.config.bindings) {
        await this.channel.bindQueue(
          binding.queue,
          binding.exchange,
          binding.routingKey,
        );
        this.logger.debug(
          `Binding created: ${binding.exchange} -> ${binding.routingKey} -> ${binding.queue}`,
        );
      }
    }
  }

  async onApplicationShutdown() {
    // Clean up all resources
    try {
      // Cancel all consumers
      if (this.channel && this.consumers.size > 0) {
        for (const [queue, consumerTag] of this.consumers.entries()) {
          await this.channel.cancel(consumerTag);
          this.logger.debug(`Consumer cancelled for queue: ${queue}`);
        }
      }

      // Close direct connection if it exists
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();

      // Close NestJS client connection
      await this.client.close();

      this.logger.log('All RabbitMQ connections closed');
    } catch (error) {
      this.logger.error('Error during RabbitMQ shutdown', error);
    }
  }

  /**
   * Publish a message using NestJS client when possible, falling back to direct
   * connection for advanced features
   */
  async publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: amqp.Options.Publish,
  ): Promise<boolean> {
    // Use direct connection if we need advanced options or not using standard routing
    if (options || !this.isStandardRoutingKey(routingKey)) {
      this.ensureInitialized();
      return this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true, ...options },
      );
    }

    // Use NestJS client for standard routing keys (maps to event patterns)
    try {
      this.client.emit(routingKey, message);
      return true;
    } catch (error) {
      this.logger.error(`Error publishing to ${routingKey}`, error);
      return false;
    }
  }

  /**
   * Publish a message with delay (always uses direct connection)
   */
  async publishWithDelay(
    exchange: string,
    routingKey: string,
    message: any,
    delayMs: number,
  ): Promise<boolean> {
    this.ensureInitialized();
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
    this.ensureInitialized();
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
    options: { priority?: number; delay?: number } = {},
  ): Promise<boolean> {
    const job = {
      jobType,
      payload,
      priority: options.priority || 0,
      enqueuedAt: Date.now(),
    };

    // Use delayed publishing if delay is specified
    if (options.delay && options.delay > 0) {
      return this.publishWithDelay(
        RABBITMQ.EXCHANGES.DELAYED,
        RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
        job,
        options.delay,
      );
    }

    // Otherwise use standard publishing
    return this.publish(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
      job,
    );
  }

  /**
   * Set up a consumer for a queue with automatic message acknowledgement
   */
  async consume<T = any>(
    queue: string,
    handler: (message: T) => Promise<void>,
    options: { noAck?: boolean; maxRetries?: number } = {},
  ): Promise<void> {
    this.ensureInitialized();
    // Set default noAck to false (meaning we will manually acknowledge)
    const consumeOptions = { noAck: options.noAck ?? false };
    
    const consumerTag = (
      await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);

            if (!consumeOptions.noAck) {
              this.channel.ack(msg);
            }
          } catch (error) {
            this.logger.error(`Error processing message from ${queue}:`, error);

            // Only handle retries if noAck is false
            if (!consumeOptions.noAck) {
              // Handle retries with exponential backoff
              const maxRetries = options.maxRetries || 3;
              const headers = msg.properties.headers || {};
              const retryCount = (headers.retryCount || 0) + 1;

              if (retryCount <= maxRetries) {
                // Delay retry with exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;

                // Publish to retry exchange
                await this.publishWithDelay(
                  RABBITMQ.EXCHANGES.RETRY,
                  msg.fields.routingKey,
                  JSON.parse(msg.content.toString()),
                  delay,
                );

                this.channel.ack(msg);
                this.logger.debug(
                  `Message requeued for retry ${retryCount}/${maxRetries} with delay ${delay}ms`,
                );
              } else {
                // Message has been retried too many times, dead-letter it
                this.channel.nack(msg, false, false);
                this.logger.warn(`Message exceeded max retries: ${maxRetries}`);
              }
            }
          }
        },
        { noAck: false },
      )
    ).consumerTag;

    this.consumers.set(queue, consumerTag);
    this.logger.log(`Consumer registered for queue: ${queue}`);
  }

  private async handleConnectionFailure(): Promise<void> {
    // Implement exponential backoff for reconnection
    let retryCount = 0;
    const maxRetries = 10;
    let reconnected = false;

    while (!reconnected && retryCount < maxRetries) {
      try {
        // Close existing connections if they exist
        try {
          if (this.channel) await this.channel.close();
          if (this.connection) await this.connection.close();
        } catch (err) {
          // Ignore errors during closure
        }

        // Wait with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        this.logger.log(
          `Attempting reconnection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Try to reconnect
        await this.setupDirectConnection();
        // await this.restoreConsumers(); 

        reconnected = true;
        this.logger.log('Successfully reconnected to RabbitMQ');
      } catch (error) {
        this.logger.error(
          `Reconnection attempt ${retryCount + 1} failed`,
          error,
        );
        retryCount++;
      }
    }

    if (!reconnected) {
      this.logger.error(`Failed to reconnect after ${maxRetries} attempts`);
    }
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
    this.ensureInitialized();
    return this.channel;
  }

  /**
   * Checks if a routing key corresponds to a standard event pattern
   */
  private isStandardRoutingKey(routingKey: string): boolean {
    // Check if this is a standard routing key that can be handled by NestJS event patterns
    const standardKeys = Object.values(RABBITMQ.ROUTING_KEYS);
    return standardKeys.includes(routingKey as any);
  }

  /**
   * Ensures the service is initialized before accessing direct connection
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.channel) {
      throw new Error(
        'RabbitMQ service not initialized or direct channel not available',
      );
    }
  }
}
