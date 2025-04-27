import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { RetryService } from './rabbitmq.retry-service';

export type JobHandler<T = any> = (data: T) => Promise<void>;

interface WorkerOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  concurrency?: number;
  timeout?: number;
}

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);
  private workers: Map<
    string,
    { handler: JobHandler; options: WorkerOptions }
  > = new Map();

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly retryService: RetryService,
  ) {}

  /**
   * Register a job handler for a specific queue
   */
  registerWorker<T = any>(
    queueName: string,
    handler: JobHandler<T>,
    options: WorkerOptions = {},
  ): void {
    this.workers.set(queueName, {
      handler,
      options: {
        maxRetries: 3,
        retryDelayMs: 1000,
        concurrency: 1,
        timeout: 60000, // 1 minute
        ...options,
      },
    });

    this.logger.log(`Worker registered for queue: ${queueName}`);
  }

  /**
   * Start processing jobs from all registered queues
   */
  async startAll(): Promise<void> {
    for (const [queueName, { handler, options }] of this.workers.entries()) {
      await this.start(queueName);
    }
  }

  /**
   * Start processing jobs for a specific queue
   */
  async start(queueName: string): Promise<void> {
    const worker = this.workers.get(queueName);
    if (!worker) {
      throw new Error(`No worker registered for queue: ${queueName}`);
    }

    const { handler, options } = worker;

    await this.rabbitMQService.subscribe(queueName, async (message) => {
      try {
        // Execute with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('Job execution timed out')),
            options.timeout,
          );
        });

        await Promise.race([
          this.retryService.executeWithRetry(
            async (data) => await handler(data),
            message,
            {
              maxRetries: options.maxRetries,
              initialDelayMs: options.retryDelayMs,
            },
          ),
          timeoutPromise,
        ]);
      } catch (error) {
        this.logger.error(
          `Failed to process job from ${queueName} after all retries`,
          error.stack,
        );
      }
    });

    this.logger.log(`Started worker for queue: ${queueName}`);
  }

  /**
   * Schedule a job to be processed by a worker
   */
  async scheduleJob(
    exchange: string,
    routingKey: string,
    data: any,
    options: { delay?: number } = {},
  ): Promise<void> {
    const { delay } = options;

    if (delay && delay > 0) {
      await this.rabbitMQService.publishWithDelay(
        exchange,
        routingKey,
        data,
        delay,
      );
    } else {
      await this.rabbitMQService.publish(exchange, routingKey, data);
    }

    this.logger.log(
      `Job scheduled for ${routingKey}${delay ? ` with ${delay}ms delay` : ''}`,
    );
  }
}
