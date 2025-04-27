import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { RabbitMQEvent, EventPayload, Job, JobOptions } from '../interfaces';

@Injectable()
export abstract class BaseProducer implements OnModuleInit {
  constructor(
    protected readonly rabbitMQService: RabbitMQService,
    protected readonly serviceName: string,
  ) {}

  async onModuleInit() {
    // The connection is already handled by RabbitMQService
  }

  /**
   * Emit an event to an exchange with a routing key
   */
  protected async emit<T extends EventPayload>(
    exchange: string,
    routingKey: string,
    payload: T,
  ): Promise<boolean> {
    const event: RabbitMQEvent<T> = {
      event: routingKey,
      payload,
      metadata: {
        timestamp: Date.now(),
        correlationId: this.generateCorrelationId(),
        service: this.serviceName,
      },
    };

    return this.rabbitMQService.publish(exchange, routingKey, event);
  }

  /**
   * Schedule an event to be processed after a delay
   */
  protected async emitWithDelay<T extends EventPayload>(
    exchange: string,
    routingKey: string,
    payload: T,
    delayMs: number,
  ): Promise<boolean> {
    const event: RabbitMQEvent<T> = {
      event: routingKey,
      payload,
      metadata: {
        timestamp: Date.now(),
        correlationId: this.generateCorrelationId(),
        service: this.serviceName,
      },
    };

    return this.rabbitMQService.publishWithDelay(
      exchange,
      routingKey,
      event,
      delayMs,
    );
  }

  /**
   * Submit a job to be processed
   */
  protected async submitJob<T = any>(
    exchange: string,
    routingKey: string,
    jobType: string,
    payload: T,
    options: JobOptions = {},
  ): Promise<boolean> {
    const job: Job<T> = {
      id: this.generateId(),
      type: jobType,
      payload,
      priority: options.priority || 0,
      createdAt: Date.now(),
      scheduledFor: options.delay ? Date.now() + options.delay : undefined,
      maxRetries: options.maxRetries,
    };

    if (options.delay && options.delay > 0) {
      return this.rabbitMQService.publishWithDelay(
        exchange,
        routingKey,
        job,
        options.delay,
      );
    }

    return this.rabbitMQService.publish(exchange, routingKey, job);
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate a unique correlation ID for tracing
   */
  protected generateCorrelationId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
